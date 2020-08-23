import React from "react";
import {
  Comment,
  CommentChain,
  CommentHandler,
  CompactThreadIndent,
  useIndent,
  ThreadIndent,
  Post,
  PostSizes,
  PostHandler,
  DefaultTheme,
  // @ts-ignore
} from "@bobaboard/ui-components";
import { useRouter } from "next/router";
import moment from "moment";
import debug from "debug";
import { PostType, CommentType } from "../../types/Types";
import {
  makeCommentsTree,
  getTotalContributions,
  getTotalNewContributions,
} from "../../utils/thread-utils";
import { useBoardTheme } from "../BoardTheme";
//import { useHotkeys } from "react-hotkeys-hook";

const log = debug("bobafrontend:threadLevel-log");

// TODO: unify this and scrollToComment
export const scrollToPost = (postId: string, color: string) => {
  log(`Beaming up to post with id ${postId}`);
  const element: HTMLElement | null = document.querySelector(
    `.post[data-post-id='${postId}']`
  );
  if (!element) {
    return;
  }
  const observer = new IntersectionObserver((observed) => {
    if (observed[0].isIntersecting) {
      postHandlers.get(postId)?.highlight(color), observer.disconnect();
    }
  });
  observer.observe(element);
  element.classList.add("outline-hidden");
  window.scroll({
    top:
      element.getBoundingClientRect().top +
      window.pageYOffset -
      (DefaultTheme.HEADER_HEIGHT_PX + 2),
    behavior: "smooth",
  });
};

export const scrollToComment = (commentId: string, color: string) => {
  log(`Beaming up to comment with id ${commentId}`);
  const element: HTMLElement | null = document.querySelector(
    `.comment[data-comment-id='${commentId}']`
  );
  if (!element) {
    return;
  }
  const observer = new IntersectionObserver((observed) => {
    if (observed[0].isIntersecting) {
      commentHandlers.get(commentId)?.highlight(color), observer.disconnect();
    }
  });
  observer.observe(element);
  element.classList.add("outline-hidden");
  window.scroll({
    top:
      element.getBoundingClientRect().top +
      window.pageYOffset -
      (DefaultTheme.HEADER_HEIGHT_PX + 2),
    behavior: "smooth",
  });
};

const CommentsThreadLevel: React.FC<{
  comment: CommentType;
  comments: CommentType[];
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
          comments={props.comments}
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

const commentHandlers = new Map<string, CommentHandler>();
const CommentsThread: React.FC<{
  comments: CommentType[];
  parentPostId: string;
  parentCommentId: string | null;
  isLoggedIn: boolean;
  level: number;
  onReplyTo: (replyTo: string) => void;
}> = (props) => {
  const { roots, parentChainMap, parentChildrenMap } = React.useMemo(
    () =>
      makeCommentsTree(
        props.comments,
        props.parentCommentId,
        props.parentPostId
      ),
    [props.comments]
  );
  return (
    <>
      {roots.map((comment: CommentType, i: number) => {
        return (
          <CommentsThreadLevel
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

const postHandlers = new Map<string, PostHandler>();

const ThreadLevel: React.FC<{
  post: PostType;
  postsMap: Map<string, PostType[]>;
  level: number;
  onNewComment: (
    replyToPostId: string,
    replyToCommentId: string | null
  ) => void;
  onNewContribution: (id: string) => void;
  isLoggedIn: boolean;
  lastOf: { level: number; postId: string }[];
}> = (props) => {
  const router = useRouter();
  const slug = router.query.boardId?.slice(1) as string;
  const { [slug]: boardData } = useBoardTheme();
  log(
    `Rendering subtree at level ${props.level} starting with post with id ${props.post.postId}`
  );
  const isLeaf = !props.postsMap.get(props.post.postId)?.length;
  log(`Leaf post? ${isLeaf}`);
  const endsArray = isLeaf
    ? props.lastOf.map((ends) => ({
        level: ends.level,
        onBeamUpClick: () => {
          scrollToPost(ends.postId, boardData.accentColor);
        },
        showAddContribution: props.isLoggedIn,
        onAddContributionClick: () => {
          props.onNewContribution(ends.postId);
        },
      }))
    : [];
  log(`Ends array: %o`, endsArray);
  return (
    <>
      <div className="level">
        <ThreadIndent
          level={props.level}
          key={`${props.level}_${props.post.postId}`}
          ends={props.post.comments ? [] : endsArray}
        >
          <div className="post outline-hidden" data-post-id={props.post.postId}>
            <Post
              key={props.post.postId}
              ref={(handler: PostHandler) =>
                postHandlers.set(props.post.postId, handler)
              }
              size={
                props.post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR
              }
              createdTime={moment.utc(props.post.created).fromNow()}
              text={props.post.content}
              secretIdentity={props.post.secretIdentity}
              userIdentity={props.post.userIdentity}
              onNewContribution={() =>
                props.onNewContribution(props.post.postId)
              }
              onNewComment={() => props.onNewComment(props.post.postId, null)}
              totalComments={props.post.comments?.length}
              directContributions={
                props.postsMap.get(props.post.postId)?.length
              }
              totalContributions={getTotalContributions(
                props.post,
                props.postsMap
              )}
              newPost={props.isLoggedIn && props.post.isNew}
              newComments={props.isLoggedIn ? props.post.newCommentsAmount : 0}
              newContributions={
                props.isLoggedIn
                  ? getTotalNewContributions(props.post, props.postsMap)
                  : 0
              }
              centered={props.postsMap.size == 0}
              answerable={props.isLoggedIn}
              onNotesClick={() => {}}
              notesUrl={"#"}
              tags={props.post.tags}
              muted={props.isLoggedIn && !props.post.isNew && props.level > 0}
            />
          </div>
        </ThreadIndent>
        {props.post.comments && (
          <ThreadIndent
            level={props.level + 1}
            ends={
              isLeaf
                ? [
                    ...endsArray,
                    {
                      level: props.level,
                      onBeamUpClick: () =>
                        scrollToPost(props.post.postId, boardData.accentColor),
                      showAddContribution: props.isLoggedIn,
                      onAddContributionClick: () => {
                        props.onNewContribution(props.post.postId);
                      },
                    },
                  ]
                : []
            }
          >
            {
              <CommentsThread
                comments={props.post.comments}
                isLoggedIn={props.isLoggedIn}
                parentPostId={props.post.postId}
                parentCommentId={null}
                level={0}
                onReplyTo={(replyToCommentId: string) =>
                  props.onNewComment(props.post.postId, replyToCommentId)
                }
              />
            }
          </ThreadIndent>
        )}
        {props.postsMap
          .get(props.post.postId)
          ?.flatMap((post: PostType, index: number, array) => (
            <ThreadLevel
              key={post.postId}
              post={post}
              postsMap={props.postsMap}
              level={props.level + 1}
              onNewComment={props.onNewComment}
              onNewContribution={props.onNewContribution}
              isLoggedIn={props.isLoggedIn}
              lastOf={
                index == array.length - 1
                  ? [
                      ...props.lastOf,
                      { level: props.level, postId: props.post.postId },
                    ]
                  : props.lastOf
              }
            />
          ))}
        <style jsx>
          {`
            .level {
              width: 100%;
            }
            .post {
              margin-top: 15px;
              scroll-margin: 10px;
              position: relative;
            }
          `}
        </style>
      </div>
    </>
  );
};

export default ThreadLevel;
