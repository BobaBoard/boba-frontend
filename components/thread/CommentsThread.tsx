import React from "react";
import {
  Comment,
  CommentChain,
  CommentHandler,
  CompactThreadIndent,
  useIndent,
} from "@bobaboard/ui-components";
import { CommentType, ThreadCommentInfoType } from "../../types/Types";
import { useThread } from "./ThreadContext";

import debug from "debug";
const log = debug("bobafrontend:threadLevel-log");
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
  return (
    <CompactThreadIndent
      level={props.level}
      startsFromViewport={indent.bounds}
      hideLine={!children}
    >
      <div className="comment" data-comment-id={props.comment.commentId}>
        {chain.length > 1 ? (
          <CommentChain
            ref={(handler: CommentHandler) => {
              chain.forEach((el) => commentHandlers.set(el.commentId, handler));
              // Typescript marks this as a read-only property but there seems to be no
              // other way to do this. TODO: investigate.
              // @ts-ignore
              indent.handler.current = handler;
            }}
            key={props.comment.commentId}
            secretIdentity={props.comment.secretIdentity}
            userIdentity={props.comment.userIdentity}
            comments={chain.map((el) => ({
              id: el.commentId,
              text: el.content,
            }))}
            muted={props.isLoggedIn && !props.comment.isNew}
            onExtraAction={
              props.isLoggedIn
                ? () => props.onReplyTo(lastCommentId)
                : undefined
            }
          />
        ) : (
          <Comment
            ref={(handler: CommentHandler) => {
              commentHandlers.set(props.comment.commentId, handler);
              // Typescript marks this as a read-only property but there seems to be no
              // other way to do this. TODO: investigate.
              // @ts-ignore
              indent.handler.current = handler;
            }}
            key={props.comment.commentId}
            id={props.comment.commentId}
            secretIdentity={props.comment.secretIdentity}
            userIdentity={props.comment.userIdentity}
            initialText={props.comment.content}
            muted={props.isLoggedIn && !props.comment.isNew}
            onExtraAction={
              props.isLoggedIn
                ? () => props.onReplyTo(props.comment.commentId)
                : undefined
            }
          />
        )}
      </div>
      {children ? (
        <CommentsThread
          level={props.level + 1}
          parentCommentId={lastCommentId}
          parentPostId={props.parentPostId}
          isLoggedIn={props.isLoggedIn}
          onReplyTo={props.onReplyTo}
        />
      ) : (
        <></>
      )}
    </CompactThreadIndent>
  );
};

// TODO: clear commentHandlers when changing thread
export const commentHandlers = new Map<string, CommentHandler>();
const CommentsThread: React.FC<{
  parentPostId: string;
  parentCommentId: string | null;
  isLoggedIn: boolean;
  level: number;
  onReplyTo: (replyTo: string) => void;
}> = (props) => {
  const { postCommentsMap } = useThread();

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
    <>
      {actualRoots.map((comment: CommentType, i: number) => {
        return (
          <CommentsThreadLevel
            key={comment.commentId}
            comment={comment}
            parentChainMap={parentChainMap}
            parentChildrenMap={parentChildrenMap}
            {...props}
          />
        );
      })}
    </>
  );
};

export default CommentsThread;
