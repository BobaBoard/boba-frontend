import React from "react";
import {
  ThreadIndent,
  Post,
  PostSizes,
  PostHandler,
  DefaultTheme,
  toast,
} from "@bobaboard/ui-components";
import { useRouter } from "next/router";
import moment from "moment";
import debug from "debug";
import { BoardData, PostType } from "../../types/Types";
import {
  getTotalContributions,
  getTotalNewContributions,
} from "../../utils/thread-utils";
import Link from "next/link";
import classnames from "classnames";
import CommentsThread, { commentHandlers } from "./CommentsThread";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { faEdit, faLink } from "@fortawesome/free-solid-svg-icons";
import { usePageDetails, ThreadPageDetails } from "utils/router-utils";
import useBoardsData from "components/hooks/useBoardsData";
import { useThreadData } from "components/hooks/useThreadData";
import { useAuth } from "components/Auth";
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
const MemoizedCommentsThread = React.memo(CommentsThread);
const MemoizedPost = React.memo(Post);
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
  onEditPost: (post: PostType) => void;
  isLoggedIn: boolean;
  lastOf?: { level: number; postId: string }[];
}> = (props) => {
  const { slug, threadId } = usePageDetails<ThreadPageDetails>();
  const { getLinkToPost } = useCachedLinks();
  const { currentBoardData } = useBoardsData() as {
    currentBoardData: BoardData;
  };
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
            scrollToPost(ends.postId, currentBoardData.accentColor);
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
                scrollToPost(props.post.postId, currentBoardData.accentColor),
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

  const onReplyTo = React.useMemo(
    () => (replyToCommentId: string) =>
      props.onNewComment(props.post.postId, replyToCommentId),
    [props.onNewComment, props.post.postId]
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
            menuOptions={React.useMemo(
              () => [
                {
                  icon: faLink,
                  name: "Copy Link",
                  link: {
                    onClick: () => {
                      const tempInput = document.createElement("input");
                      tempInput.value = new URL(
                        linkToPost?.href as string,
                        window.location.origin
                      ).toString();
                      document.body.appendChild(tempInput);
                      tempInput.select();
                      document.execCommand("copy");
                      document.body.removeChild(tempInput);
                      toast.success("Link copied!");
                    },
                  },
                },
                // Add options just for logged in users
                ...(props.isLoggedIn
                  ? [
                      {
                        icon: faEdit,
                        name: "Edit tags",
                        link: {
                          onClick: () => {
                            props.onEditPost(props.post);
                          },
                        },
                      },
                    ]
                  : []),
              ],
              [props.isLoggedIn, props.post, props.onEditPost, linkToPost]
            )}
          />
        </div>
      </MemoizedThreadIndent>
      {props.post.comments && (
        <MemoizedThreadIndent level={props.level + 1} ends={commentsEnds}>
          <MemoizedCommentsThread
            isLoggedIn={props.isLoggedIn}
            parentPostId={props.post.postId}
            parentCommentId={null}
            level={0}
            onReplyTo={onReplyTo}
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
            onEditPost={props.onEditPost}
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
  onEditPost: (post: PostType) => void;
}> = (props) => {
  const { isLoggedIn } = useAuth();
  const { threadId, slug, postId, threadBaseUrl } = usePageDetails<
    ThreadPageDetails
  >();
  const { currentRoot, parentChildrenMap } = useThreadData({
    threadId,
    slug,
    postId,
  });
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
          as={`${threadBaseUrl}${url.search}`}
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
        isLoggedIn={isLoggedIn}
        onEditPost={props.onEditPost}
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

export default React.memo(ThreadView);
