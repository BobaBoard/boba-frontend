import React from "react";
import {
  ThreadIndent,
  Post,
  PostSizes,
  PostHandler,
  DefaultTheme,
} from "@bobaboard/ui-components";
import { useRouter } from "next/router";
import moment from "moment";
import debug from "debug";
import { useThread } from "components/thread/ThreadContext";
import { PostType } from "../../types/Types";
import {
  getTotalContributions,
  getTotalNewContributions,
} from "../../utils/thread-utils";
import Link from "next/link";
import { useBoardContext } from "../BoardContext";
import classnames from "classnames";
import CommentsThread, { commentHandlers } from "./CommentsThread";
import { useCachedLinks } from "components/hooks/useCachedLinks";
//import { useHotkeys } from "react-hotkeys-hook";

const log = debug("bobafrontend:threadLevel-log");
const info = debug("bobafrontend:threadLevel-info");

// TODO: unify1 this and scrollToComment
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

const MemoizedThreadIndent = React.memo(ThreadIndent);
const MemoizedPost = React.memo(Post);
const MemoizedCommentsThread = React.memo(CommentsThread);
const postHandlers = new Map<string, PostHandler>();
const ThreadLevel: React.FC<{
  post: PostType;
  postsMap: Map<string, { children: PostType[]; parent: PostType | null }>;
  level: number;
  onNewComment: (
    replyToPostId: string,
    replyToCommentId: string | null
  ) => void;
  onNewContribution: (id: string) => void;
  isLoggedIn: boolean;
  lastOf?: { level: number; postId: string }[];
}> = (props) => {
  const router = useRouter();
  const slug = router.query.boardId?.slice(1) as string;
  const threadId = router.query.threadId?.[0] as string;
  const { getLinkToPost } = useCachedLinks();
  const { boardsData } = useBoardContext();
  info(
    `Rendering subtree at level ${props.level} starting with post with id ${props.post.postId}`
  );
  const isLeaf = !props.postsMap.get(props.post.postId)?.children?.length;
  info(`Leaf post? ${isLeaf}`);
  const endsArray =
    isLeaf && props.lastOf
      ? props.lastOf.map((ends) => ({
          level: ends.level,
          onBeamUpClick: () => {
            scrollToPost(ends.postId, boardsData[slug].accentColor);
          },
          showAddContribution: props.isLoggedIn,
          onAddContributionClick: () => {
            props.onNewContribution(ends.postId);
          },
        }))
      : [];
  info(`Ends array: %o`, endsArray);
  const linkToPost = getLinkToPost({
    slug,
    threadId: threadId,
    postId: props.post.postId,
  });
  const ends = React.useMemo(
    () => [
      ...(props.lastOf || []),
      { level: props.level, postId: props.post.postId },
    ],
    [props.level, props.post.postId, props.lastOf]
  );
  const commentsEnds = React.useMemo(
    () =>
      isLeaf
        ? [
            ...endsArray,
            {
              level: props.level,
              onBeamUpClick: () =>
                scrollToPost(props.post.postId, boardsData[slug].accentColor),
              showAddContribution: props.isLoggedIn,
              onAddContributionClick: () => {
                props.onNewContribution(props.post.postId);
              },
            },
          ]
        : [],
    [
      props.level,
      props.post,
      props.isLoggedIn,
      props.onNewContribution,
      scrollToPost,
    ]
  );
  const replyToComment = React.useCallback(
    (replyToCommentId: string) =>
      props.onNewComment(props.post.postId, replyToCommentId),
    [props.post.postId]
  );

  return (
    <>
      <MemoizedThreadIndent
        level={props.level}
        key={`${props.level}_${props.post.postId}`}
        ends={props.post.comments ? undefined : endsArray}
      >
        <div className="post outline-hidden" data-post-id={props.post.postId}>
          <MemoizedPost
            key={props.post.postId}
            ref={React.useCallback(
              (handler: PostHandler) =>
                postHandlers.set(props.post.postId, handler),
              [props.post.postId]
            )}
            size={props.post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR}
            createdTime={moment.utc(props.post.created).fromNow()}
            createdTimeLink={linkToPost}
            notesLink={linkToPost}
            text={props.post.content}
            secretIdentity={props.post.secretIdentity}
            userIdentity={props.post.userIdentity}
            onNewContribution={React.useCallback(
              () => props.onNewContribution(props.post.postId),
              []
            )}
            onNewComment={React.useCallback(
              () => props.onNewComment(props.post.postId, null),
              []
            )}
            totalComments={props.post.comments?.length}
            directContributions={
              props.postsMap.get(props.post.postId)?.children?.length
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
            tags={props.post.tags}
            muted={props.isLoggedIn && !props.post.isNew && props.level > 0}
          />
        </div>
      </MemoizedThreadIndent>
      {props.post.comments && (
        <MemoizedThreadIndent level={props.level + 1} ends={commentsEnds}>
          <MemoizedCommentsThread
            isLoggedIn={props.isLoggedIn}
            parentPostId={props.post.postId}
            comments={props.post.comments}
            parentCommentId={null}
            level={0}
            onReplyTo={replyToComment}
          />
        </MemoizedThreadIndent>
      )}
      {props.postsMap
        .get(props.post.postId)
        ?.children.flatMap((post: PostType, index: number, array) => (
          <MemoizedThreadLevel
            key={post.postId}
            post={post}
            postsMap={props.postsMap}
            level={props.level + 1}
            onNewComment={props.onNewComment}
            onNewContribution={props.onNewContribution}
            isLoggedIn={props.isLoggedIn}
            lastOf={index == array.length - 1 ? ends : props.lastOf}
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
    </>
  );
};

const MemoizedThreadLevel = React.memo(ThreadLevel);
const ThreadView: React.FC<{
  onNewComment: (
    replyToPostId: string,
    replyToCommentId: string | null
  ) => void;
  onNewContribution: (id: string) => void;
  isLoggedIn: boolean;
}> = (props) => {
  const { currentRoot, parentChildrenMap, postId, baseUrl } = useThread();
  const router = useRouter();

  if (!currentRoot) {
    return <div />;
  }
  const url = new URL(`${window.location.origin}${router.asPath}`);
  return (
    <>
      <div
        className={classnames("whole-thread", {
          visible: !!postId,
        })}
      >
        <Link
          as={`${baseUrl}${url.search}`}
          href={`/[boardId]/thread/[...threadId]`}
          shallow={true}
        >
          <a>Show whole thread</a>
        </Link>
      </div>
      <MemoizedThreadLevel
        post={currentRoot}
        postsMap={parentChildrenMap}
        level={0}
        onNewComment={props.onNewComment}
        onNewContribution={props.onNewContribution}
        isLoggedIn={props.isLoggedIn}
      />
      <style jsx>{`
        .whole-thread {
          margin-bottom: -5px;
          padding-top: 10px;
          display: none;
        }
        .whole-thread.visible {
          display: block;
        }
        .whole-thread a {
          color: white;
          font-size: 13px;
        }
      `}</style>
    </>
  );
};

export default ThreadView;
