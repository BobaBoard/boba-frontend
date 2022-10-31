import {
  Comment,
  CommentHandler,
  DefaultTheme,
  NewCommentsThread,
} from "@bobaboard/ui-components";
import {
  CommentType,
  RealmPermissions,
  ThreadCommentInfoType,
} from "types/Types";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import {
  useBoardSummary,
  useCurrentRealmBoardId,
  useRealmPermissions,
} from "contexts/RealmContext";

import { LinkWithAction } from "@bobaboard/ui-components/dist/types";
import React from "react";
import debug from "debug";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import { formatDistanceToNow } from "date-fns";
import { isCommentEditorState } from "components/editors/types";
import { useAuth } from "components/Auth";
import { useEditorsState } from "components/editors/EditorsContext";
import { useForceHideIdentity } from "components/hooks/useForceHideIdentity";
import { useThreadContext } from "./ThreadContext";
import { useThreadEditors } from "components/editors/withEditors";

const log = debug("bobafrontend:CommentsThread-log");
// const info = debug("bobafrontend:CommentsThread-info");

const getCommentsChain = (
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

export const isCommentLoaded = (commentId: string) => {
  return !!document.querySelector(`.comment[data-comment-id='${commentId}']`);
};
export const scrollToComment = (commentId: string, color: string) => {
  log(`Beaming up to comment with id ${commentId}`);
  const element: HTMLElement | null = document.querySelector(
    `.comment[data-comment-id='${commentId}']`
  );
  if (!element) {
    return;
  }
  const observer: IntersectionObserver = new IntersectionObserver(
    (observed) => {
      if (observed[0].isIntersecting) {
        commentHandlers.get(commentId)?.highlight(color), observer.disconnect();
      }
    }
  );
  observer.observe(element);
  element.classList.add("outline-hidden");
  window.scroll({
    top:
      element.getBoundingClientRect().top +
      window.pageYOffset -
      (DefaultTheme.HEADER_HEIGHT_PX + 25),
    behavior: "smooth",
  });
};

// TODO: clear commentHandlers when changing thread
export const commentHandlers = new Map<string, CommentHandler>();
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
  const realmPermissions = useRealmPermissions();
  const { forceHideIdentity } = useForceHideIdentity();
  const { onNewComment } = useThreadEditors();
  const { postCommentsMap, opIdentity } = useThreadContext();
  const { parentChainMap } = postCommentsMap.get(parentPostId)!;
  const { slug } = usePageDetails<ThreadPageDetails>();
  const boardId = useCurrentRealmBoardId({
    boardSlug: slug,
  });
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
      chainInfo.forEach((el) => commentHandlers.set(el.id, handler));
      onBoundaryRef({
        positionX: handler.avatarRef?.current || undefined,
        positionY: handler.headerRef?.current || undefined,
      });
    },
    [chainInfo, onBoundaryRef]
  );
  const options = React.useMemo(
    () =>
      realmPermissions.includes(RealmPermissions.COMMENT_ON_REALM)
        ? [
            {
              name: "Reply",
              icon: faComment,
              link: replyToLast,
            },
          ]
        : undefined,
    [replyToLast, realmPermissions]
  );

  return (
    <>
      {isCurrentReplyToComment && (
        <div className="current-reply-header">You're replying to:</div>
      )}
      <div className={isCurrentReplyToComment ? "current-reply-outline" : ""}>
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
          outline: 3px solid ${boardColor};
          border-radius: 15px;
        }
        .current-reply-header {
          color: rgb(255, 255, 255);
          padding-left: 10px;
          padding-bottom: 7px;
          font-size: 1.3rem;
        }
      `}</style>
    </>
  );
};

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

  const children = parentChildrenMap.get(chain[chain.length - 1].commentId);
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
          {children && (
            <NewCommentsThread.Indent id={comment.commentId}>
              {children.map((comment: CommentType) => {
                return (
                  <MemoizedThreadLevel
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
const MemoizedThreadLevel = React.memo(CommentsThreadLevel);

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
  const actualRoots = props.parentCommentId
    ? parentChildrenMap.get(props.parentCommentId) || []
    : roots;

  return (
    <div className="comments-thread-container">
      {actualRoots.map((comment) => {
        return (
          <div className="comments-thread" key={comment.commentId}>
            <NewCommentsThread disableMotionEffect={props.disableMotionEffect}>
              <MemoizedThreadLevel
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
