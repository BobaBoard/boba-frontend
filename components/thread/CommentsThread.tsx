import {
  Comment,
  CommentHandler,
  NewCommentsThread,
} from "@bobaboard/ui-components";
import {
  CommentOptions,
  useCommentOptions,
} from "components/options/useCommentOptions";
import {
  CommentType,
  RealmPermissions,
  ThreadCommentInfoType,
} from "types/Types";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import {
  addCommentHandlerRef,
  removeCommentHandlerRef,
  scrollToComment,
} from "utils/scroll-utils";
import {
  useBoardSummary,
  useCurrentRealmBoardId,
  useRealmPermissions,
} from "contexts/RealmContext";

import { LinkWithAction } from "@bobaboard/ui-components/dist/types";
import React from "react";
import classNames from "classnames";
import { formatDistanceToNow } from "date-fns";
import { isCommentEditorState } from "components/editors/types";
import { useAuth } from "components/Auth";
import { useEditorsState } from "components/editors/EditorsContext";
import { useForceHideIdentity } from "components/hooks/useForceHideIdentity";
import { useThreadContext } from "./ThreadContext";
import { useThreadEditors } from "components/editors/withEditors";

const COMMENT_OPTIONS = [
  CommentOptions.GO_TO_COMMENT,
  CommentOptions.COPY_COMMENT_LINK,
  CommentOptions.REPLY_TO_COMMENT,
];

// TODO: consider doing this directly as part of ThreadCommentInfoType.
export const getCommentsChain = (
  rootComment: CommentType,
  parentChainMap: ThreadCommentInfoType["parentChainMap"]
) => {
  const chain = [rootComment];
  while (parentChainMap.has(chain[chain.length - 1].commentId)) {
    const next = parentChainMap.get(chain[chain.length - 1].commentId)!;
    chain.push(next);
  }
  return chain;
};

/**
 * ThreadComment displays the rootComment, and all the other comments
 * in its chain, if any exists.
 */
const ThreadComment: React.FC<{
  rootComment: CommentType;
  parentPostId: string;
  onBoundaryRef: (
    boundary: {
      positionX?: HTMLElement;
      positionY?: HTMLElement;
    } | null
  ) => void;
  disableMotionEffect?: boolean;
}> = ({ rootComment, parentPostId, onBoundaryRef, disableMotionEffect }) => {
  const { isLoggedIn } = useAuth();
  const { slug, commentId } = usePageDetails<ThreadPageDetails>();
  const boardId = useCurrentRealmBoardId({
    boardSlug: slug,
  });
  const realmPermissions = useRealmPermissions();
  const { forceHideIdentity } = useForceHideIdentity();
  const { onNewComment } = useThreadEditors();
  const { postCommentsMap, opIdentity } = useThreadContext();
  const { parentChainMap } = postCommentsMap.get(parentPostId)!;
  const hasBeenScrolledTo = React.useRef(false);

  const boardColor = useBoardSummary({ boardId })?.accentColor;
  const editorState = useEditorsState();
  const chainInfo = React.useMemo(
    () =>
      getCommentsChain(rootComment, parentChainMap).map((comment) => ({
        id: comment.commentId,
        text: comment.content,
      })),
    [rootComment, parentChainMap]
  );
  const isCurrentReplyToComment =
    isCommentEditorState(editorState) &&
    editorState.newComment.replyToCommentId ===
      chainInfo[chainInfo.length - 1].id;

  // When we reply to a chain, we must reply to the last comment.
  const replyToLast = React.useMemo<LinkWithAction>(
    () => ({
      onClick: () =>
        onNewComment(parentPostId, chainInfo[chainInfo.length - 1].id),
      label: "Add a new comment",
    }),
    [parentPostId, chainInfo, onNewComment]
  );
  const onSetRef = React.useCallback(
    (handler: CommentHandler | null) => {
      if (handler == null) {
        return;
      }
      chainInfo.forEach((el) =>
        addCommentHandlerRef({ commentId: el.id, ref: handler })
      );
      onBoundaryRef({
        positionX: handler.avatarRef?.current || undefined,
        positionY: handler.headerRef?.current || undefined,
      });
    },
    [chainInfo, onBoundaryRef]
  );

  React.useEffect(() => {
    // When the components is unmounted, we remove the ref from memory.
    return () => {
      chainInfo.forEach((el) => {
        console.log("removing comment handler", el.id);
        removeCommentHandlerRef({ commentId: el.id });
      });
    };
  }, [chainInfo]);

  const options = useCommentOptions({
    comment: rootComment,
    options: COMMENT_OPTIONS,
  });

  return (
    <>
      {isCurrentReplyToComment && (
        <div className="current-reply-header">You're replying to:</div>
      )}
      <div
        className={classNames({
          "current-reply-outline": isCurrentReplyToComment,
          "current-display-outline": commentId == rootComment.commentId,
        })}
        ref={React.useCallback(() => {
          // When we're in a specific page with a comments thread, we scroll
          // to that comment upon first load.
          if (
            hasBeenScrolledTo.current ||
            commentId != rootComment.commentId ||
            !boardColor
          ) {
            return;
          }
          // Without this setTimeout the page seems to start scrolling on load
          // then goes back up. We add a delay so we don't have to deal with
          // fixing it right now.
          // TODO: remove the setTimeout hack
          setTimeout(() => {
            scrollToComment(commentId, boardColor);
            hasBeenScrolledTo.current = true;
          }, 500);
        }, [hasBeenScrolledTo, commentId, boardColor, rootComment.commentId])}
      >
        <Comment
          ref={onSetRef}
          key={rootComment.commentId}
          secretIdentity={rootComment.secretIdentity}
          userIdentity={rootComment.userIdentity}
          createdTime={formatDistanceToNow(new Date(rootComment.created), {
            addSuffix: true,
          })}
          comments={chainInfo}
          new={isLoggedIn && rootComment.isNew}
          op={rootComment.secretIdentity.name == opIdentity?.name}
          onExtraAction={
            realmPermissions.includes(RealmPermissions.COMMENT_ON_REALM) &&
            !editorState.isOpen
              ? replyToLast
              : undefined
          }
          options={options}
          forceHideIdentity={forceHideIdentity}
          disableMotionOnScroll={disableMotionEffect}
        />
      </div>
      <style jsx>{`
        .current-reply-outline {
          outline: 4px solid ${boardColor};
          background-color: ${boardColor};
          border-radius: 15px;
        }
        .current-reply-header {
          color: rgb(255, 255, 255);
          padding-left: 10px;
          padding-bottom: 7px;
          font-size: 1.3rem;
        }
        .current-display-outline :global(.comments-container) {
          box-shadow: 0px 0px 0px 4px ${boardColor};
        }
      `}</style>
    </>
  );
};

/**
 * CommentsThreadLevel displays the given comment, then indents all
 * its replies (if any exists) within another CommentsThreadLevel.
 */
const CommentsThreadLevel: React.FC<{
  comment: CommentType;
  parentPostId: string;
  disableMotionEffect?: boolean;
}> = ({ parentPostId, comment, disableMotionEffect }) => {
  const { postCommentsMap } = useThreadContext();
  const { parentChainMap, parentChildrenMap } =
    postCommentsMap.get(parentPostId)!;

  const chain = React.useMemo(
    () => getCommentsChain(comment, parentChainMap),
    [comment, parentChainMap]
  );

  const lastChainCommentId = chain[chain.length - 1].commentId;
  const replies = parentChildrenMap.get(lastChainCommentId);
  return (
    <NewCommentsThread.Item>
      {(setBoundaryElement) => (
        <>
          <div className="comment" data-comment-id={comment.commentId}>
            <ThreadComment
              rootComment={comment}
              parentPostId={parentPostId}
              onBoundaryRef={setBoundaryElement}
              disableMotionEffect={disableMotionEffect}
            />
          </div>
          {replies && (
            <NewCommentsThread.Indent id={comment.commentId}>
              {replies.map((comment: CommentType) => {
                return (
                  <MemoizedCommentThreadLevel
                    key={comment.commentId}
                    comment={comment}
                    parentPostId={parentPostId}
                    disableMotionEffect={disableMotionEffect}
                  />
                );
              })}
            </NewCommentsThread.Indent>
          )}
        </>
      )}
    </NewCommentsThread.Item>
  );
};
const MemoizedCommentThreadLevel = React.memo(CommentsThreadLevel);

interface CommentsThreadProps {
  parentPostId: string;
  parentCommentId?: string | null;
  level?: number;
  disableMotionEffect?: boolean;
}

const CommentsThread: React.FC<CommentsThreadProps> = (props) => {
  const { postCommentsMap } = useThreadContext();

  if (!postCommentsMap.has(props.parentPostId)) {
    return null;
  }

  const { roots, parentChildrenMap } = postCommentsMap.get(props.parentPostId)!;
  // TODO: check if parentCommentId is still used
  const actualRoots = props.parentCommentId
    ? parentChildrenMap.get(props.parentCommentId) || []
    : roots;

  return (
    <div className="comments-thread-container">
      {actualRoots.map((comment) => {
        return (
          <div className="comments-thread" key={comment.commentId}>
            <NewCommentsThread disableMotionEffect={props.disableMotionEffect}>
              <MemoizedCommentThreadLevel
                key={comment.commentId}
                comment={comment}
                parentPostId={props.parentPostId}
                disableMotionEffect={props.disableMotionEffect}
              />
            </NewCommentsThread>
          </div>
        );
      })}
      <style jsx>{`
        .comments-thread-container {
          pointer-events: all;
          margin-left: 15px;
        }
        .comments-thread {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default React.memo(CommentsThread);
