import React from "react";
import {
  CommentChain,
  CommentHandler,
  CompactThreadIndent,
  useIndent,
} from "@bobaboard/ui-components";
import { CommentType, ThreadCommentInfoType } from "../../types/Types";

import debug from "debug";
import { useThreadData } from "components/hooks/useThreadData";
import { usePageDetails, ThreadPageDetails } from "utils/router-utils";
// @ts-expect-error
const log = debug("bobafrontend:threadLevel-log");
// @ts-expect-error
const info = debug("bobafrontend:threadLevel-info");

const CommentsThreadLevel: React.FC<{
  comment: CommentType;
  parentChainMap: Map<string, CommentType>;
  parentChildrenMap: Map<string, CommentType[]>;
  parentPostId: string;
  parentCommentId: string | null;
  isLoggedIn: boolean;
  level: number;
  onReplyTo: (replyTo: string) => void;
}> = (props) => {
  const indent = useIndent();
  const chain = [props.comment];
  let currentChainId = props.comment.commentId;
  while (props.parentChainMap.has(currentChainId)) {
    const next = props.parentChainMap.get(currentChainId) as CommentType;
    chain.push(next);
    currentChainId = next.commentId;
  }
  const lastCommentId = chain[chain.length - 1].commentId;
  const children = props.parentChildrenMap.get(lastCommentId);
  const replyToLast = React.useCallback(() => props.onReplyTo(lastCommentId), [
    lastCommentId,
  ]);

  const threadIndent = React.useMemo(() => {
    return (
      <>
        <div className="comment" data-comment-id={props.comment.commentId}>
          <CommentChain
            ref={(handler: CommentHandler | null) => {
              if (handler == null) {
                return;
              }
              chain.forEach((el) => commentHandlers.set(el.commentId, handler));
              indent.setHandler(handler);
            }}
            key={props.comment.commentId}
            secretIdentity={props.comment.secretIdentity}
            userIdentity={props.comment.userIdentity}
            comments={chain.map((el) => ({
              id: el.commentId,
              text: el.content,
            }))}
            muted={props.isLoggedIn && !props.comment.isNew}
            onExtraAction={props.isLoggedIn ? replyToLast : undefined}
          />
        </div>
        {children ? (
          <MemoizedCommentsThread
            level={props.level + 1}
            parentCommentId={lastCommentId}
            parentPostId={props.parentPostId}
            isLoggedIn={props.isLoggedIn}
            onReplyTo={props.onReplyTo}
          />
        ) : (
          <></>
        )}
      </>
    );
  }, [props, lastCommentId]);
  return (
    <CompactThreadIndent
      level={props.level}
      startsFromViewport={indent.bounds}
      hideLine={!children}
    >
      {threadIndent}
    </CompactThreadIndent>
  );
};

// TODO: clear commentHandlers when changing thread
export const commentHandlers = new Map<string, CommentHandler>();
const Profiler = React.Profiler;

const MemoizedCommentsThreadLevel = React.memo(CommentsThreadLevel);
const CommentsThread: React.FC<{
  parentPostId: string;
  parentCommentId: string | null;
  isLoggedIn: boolean;
  level: number;
  onReplyTo: (replyTo: string) => void;
}> = (props) => {
  const { slug, threadId } = usePageDetails<ThreadPageDetails>();
  const { postCommentsMap } = useThreadData({ threadId, slug });

  if (!postCommentsMap.has(props.parentPostId)) {
    return <div />;
  }

  const { roots, parentChainMap, parentChildrenMap } = postCommentsMap.get(
    props.parentPostId
  ) as ThreadCommentInfoType;
  let actualRoots = props.parentCommentId
    ? parentChildrenMap.get(props.parentCommentId) || []
    : roots;
  return (
    <Profiler
      id={`commentThread ${props.parentPostId}`}
      onRender={(
        ProfilerId,
        Phase,
        ActualDuration,
        BaseDuration,
        StartTime,
        CommitTime,
        Interactions
      ) =>
        console.log({
          ProfilerId,
          Phase,
          ActualDuration,
          BaseDuration, //time taken by react
          StartTime, //time at which render starts
          CommitTime,
          Interactions, // this is gotten from the rapping API
        })
      }
    >
      {actualRoots.map((comment: CommentType, i: number) => {
        return (
          <MemoizedCommentsThreadLevel
            key={comment.commentId}
            comment={comment}
            parentChainMap={parentChainMap}
            parentChildrenMap={parentChildrenMap}
            {...props}
          />
        );
      })}
    </Profiler>
  );
};
const MemoizedCommentsThread = React.memo(CommentsThread);

export default CommentsThread;
