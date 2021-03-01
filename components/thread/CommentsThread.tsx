import React from "react";
import {
  CommentChain,
  CommentHandler,
  NewCommentsThread,
} from "@bobaboard/ui-components";
import { CommentType, ThreadCommentInfoType } from "../../types/Types";
import { ThreadContextType, withThreadData } from "./ThreadQueryHook";

import debug from "debug";
import moment from "moment";
import { useAuth } from "components/Auth";
import {
  EditorActions,
  useEditorsDispatch,
} from "components/editors/EditorsContext";
// @ts-expect-error
const log = debug("bobafrontend:threadLevel-log");
// @ts-expect-error
const info = debug("bobafrontend:threadLevel-info");

const CommentsThreadLevel: React.FC<{
  comment: CommentType;
  parentChainMap: Map<string, CommentType>;
  parentChildrenMap: Map<string, CommentType[]>;
  parentPostId: string;
  parentCommentId?: string | null;
  level?: number;
  onReplyTo: (replyTo: string) => void;
}> = (props) => {
  const { isLoggedIn } = useAuth();
  const chain = React.useMemo(() => {
    const chain = [props.comment];
    while (props.parentChainMap.has(currentChainId)) {
      const next = props.parentChainMap.get(currentChainId) as CommentType;
      chain.push(next);
      currentChainId = next.commentId;
    }
    return chain.map((el) => ({
      id: el.commentId,
      text: el.content,
    }));
  }, [props.comment, props.parentChainMap]);
  let currentChainId = props.comment.commentId;

  const lastCommentId = chain[chain.length - 1].id;
  const children = props.parentChildrenMap.get(lastCommentId);
  const replyToLast = React.useCallback(() => props.onReplyTo(lastCommentId), [
    lastCommentId,
  ]);
  return (
    <NewCommentsThread.Item>
      {(setBoundaryElement) => (
        <>
          <div className="comment" data-comment-id={props.comment.commentId}>
            <CommentChain
              ref={React.useCallback(
                (handler: CommentHandler | null) => {
                  if (handler == null) {
                    return;
                  }
                  chain.forEach((el) => commentHandlers.set(el.id, handler));
                  setBoundaryElement(handler.avatarRef?.current || null);
                },
                [chain]
              )}
              key={props.comment.commentId}
              secretIdentity={props.comment.secretIdentity}
              userIdentity={props.comment.userIdentity}
              createdTime={moment.utc(props.comment.created).fromNow()}
              accessory={props.comment.accessory}
              comments={chain}
              muted={isLoggedIn && !props.comment.isNew}
              onExtraAction={isLoggedIn ? replyToLast : undefined}
            />
          </div>
          {children && (
            <NewCommentsThread.Indent id={props.comment.commentId}>
              {children.map((comment: CommentType, i: number) => {
                return (
                  <MemoizedThreadLevel
                    key={comment.commentId}
                    comment={comment}
                    parentPostId={props.parentPostId}
                    parentChainMap={props.parentChainMap}
                    parentChildrenMap={props.parentChildrenMap}
                    onReplyTo={props.onReplyTo}
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

interface CommentsThreadProps extends ThreadContextType {
  parentPostId: string;
  parentCommentId?: string | null;
  level?: number;
}

// TODO: clear commentHandlers when changing thread
export const commentHandlers = new Map<string, CommentHandler>();
const CommentsThread: React.FC<CommentsThreadProps> = (props) => {
  const dispatch = useEditorsDispatch();
  const onReplyToComment = React.useCallback(
    (replyToCommentId: string) => {
      if (!props.parentBoardSlug || !props.threadId) {
        return;
      }
      dispatch({
        type: EditorActions.NEW_COMMENT,
        payload: {
          boardSlug: props.parentBoardSlug,
          threadId: props.threadId,
          replyToContributionId: props.parentPostId,
          replyToCommentId,
        },
      });
    },
    [props.threadId, props.parentBoardSlug, props.parentPostId, dispatch]
  );

  const onCollapseLevel = React.useCallback(() => {}, []);
  const onUncollapseLevel = React.useCallback(() => {}, []);
  const getCollapseReason = React.useCallback(() => {
    return <div>Subthread manually hidden.</div>;
  }, []);

  if (!props.postCommentsMap.has(props.parentPostId)) {
    return <div />;
  }

  const {
    roots,
    parentChainMap,
    parentChildrenMap,
  } = props.postCommentsMap.get(props.parentPostId) as ThreadCommentInfoType;
  let actualRoots = props.parentCommentId
    ? parentChildrenMap.get(props.parentCommentId) || []
    : roots;
  return (
    <div className="comments-thread-container">
      {actualRoots.map((comment: CommentType, i: number) => {
        return (
          <div className="comments-thread" key={comment.commentId}>
            <NewCommentsThread
              onCollapseLevel={onCollapseLevel}
              onUncollapseLevel={onUncollapseLevel}
              getCollapseReason={getCollapseReason}
            >
              <MemoizedThreadLevel
                key={comment.commentId}
                comment={comment}
                parentPostId={props.parentPostId}
                parentChainMap={parentChainMap}
                parentChildrenMap={parentChildrenMap}
                onReplyTo={onReplyToComment}
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

const MemoizedCommentsThread = React.memo(CommentsThread);

export default withThreadData(MemoizedCommentsThread);
