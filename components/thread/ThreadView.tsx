import React from "react";
import { NewThread, PostHandler, DefaultTheme } from "@bobaboard/ui-components";
import { useRouter } from "next/router";
import ThreadPost from "./ThreadPost";
import debug from "debug";
import {
  ThreadContextType,
  withThreadData,
} from "components/thread/ThreadQueryHook";
import { PostType } from "../../types/Types";
import Link from "next/link";
import { useBoardContext } from "../BoardContext";
import classnames from "classnames";
import CommentsThread, { commentHandlers } from "./CommentsThread";
import { usePageDetails, ThreadPageDetails } from "utils/router-utils";
import {
  EditorActions,
  useEditorsDispatch,
} from "components/editors/EditorsContext";
import { useAuth } from "components/Auth";

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

// const MemoizedThreadIndent = React.memo(ThreadIndent);
const postHandlers = new Map<string, PostHandler>();
const ThreadLevel: React.FC<{
  post: PostType;
  postsMap: Map<string, { children: PostType[]; parent: PostType | null }>;
  level?: number;
  onNewComment: (
    replyToPostId: string,
    replyToCommentId: string | null
  ) => void;
  onNewContribution: (id: string) => void;
  onEditPost: (post: PostType) => void;
  isLoggedIn: boolean;
  lastOf?: { level: number; postId: string }[];
  showThread?: boolean;
  collapsedIndents: string[];
}> = (props) => {
  const router = useRouter();
  const slug = router.query.boardId?.slice(1) as string;
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
  // const ends = React.useMemo(
  //   () => [
  //     ...(props.lastOf || []),
  //     { level: props.level, postId: props.post.postId },
  //   ],
  //   [props.level, props.post.postId, props.lastOf]
  // );
  // const commentsEnds = React.useMemo(
  //   () =>
  //     isLeaf
  //       ? [
  //           ...endsArray,
  //           {
  //             level: props.level,
  //             onBeamUpClick: () =>
  //               scrollToPost(props.post.postId, boardsData[slug].accentColor),
  //             showAddContribution: props.isLoggedIn,
  //             onAddContributionClick: () => {
  //               props.onNewContribution(props.post.postId);
  //             },
  //           },
  //         ]
  //       : [],
  //   [
  //     props.level,
  //     props.post,
  //     props.isLoggedIn,
  //     props.onNewContribution,
  //     scrollToPost,
  //   ]
  // );
  return (
    <>
      <NewThread.Item key={props.post.postId}>
        {(setHandler) => (
          <>
            <div
              className={classnames("post", {
                "with-indent": props.postsMap.has(props.post.postId),
              })}
              data-post-id={props.post.postId}
            >
              <ThreadPost
                post={props.post}
                isLoggedIn={props.isLoggedIn}
                onNewContribution={props.onNewContribution}
                onNewComment={props.onNewComment}
                onEditPost={props.onEditPost}
                ref={(postRef) => {
                  if (postRef) {
                    postHandlers.set(props.post.postId, postRef);
                  }
                  setHandler(postRef?.avatarRef?.current || null);
                }}
              />
            </div>
            {(props.postsMap.has(props.post.postId) ||
              props.post.comments?.length) && (
              <NewThread.Indent
                id={`indent_${props.post.postId}`}
                collapsed={props.collapsedIndents.some(
                  (id) => id == `indent_${props.post.postId}`
                )}
              >
                <div className="comments">
                  <CommentsThread parentPostId={props.post.postId} />
                </div>
                {props.postsMap
                  .get(props.post.postId)
                  ?.children.flatMap((post: PostType, index: number, array) => (
                    <ThreadLevel key={post.postId} {...props} post={post} />
                  ))}
              </NewThread.Indent>
            )}
          </>
        )}
      </NewThread.Item>
      <style jsx>
        {`
          .level {
            width: 100%;
          }
          .comments {
            pointer-events: all;
            margin-left: 10px;
            margin-top: -5px;
            margin-right: 10px;
          }
          .post {
            margin-top: 30px;
            margin-bottom: 15px;
            position: relative;
            pointer-events: none !important;
          }
        `}
      </style>
    </>
  );
};

interface ThreadViewProps extends ThreadContextType {
  onTotalPostsChange: (total: number) => void;
}
//const MemoizedThreadLevel = React.memo(ThreadLevel);
const ThreadView: React.FC<ThreadViewProps> = ({
  currentRoot,
  threadRoot,
  parentChildrenMap,
  chronologicalPostsSequence,
  ...props
}) => {
  const {
    postId,
    threadBaseUrl,
    slug: boardSlug,
    threadId,
  } = usePageDetails<ThreadPageDetails>();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const dispatch = useEditorsDispatch();
  const [collapse, setCollapse] = React.useState<string[]>([]);

  const onNewComment = React.useCallback(
    (replyToContributionId: string, replyToCommentId: string | null) => {
      dispatch({
        type: EditorActions.NEW_COMMENT,
        payload: {
          boardSlug,
          threadId,
          replyToContributionId,
          replyToCommentId,
        },
      });
    },
    [boardSlug, threadId]
  );

  const onNewContribution = React.useCallback(
    (replyToContributionId: string) => {
      dispatch({
        type: EditorActions.NEW_CONTRIBUTION,
        payload: {
          boardSlug,
          threadId,
          replyToContributionId,
        },
      });
    },
    [boardSlug, threadId]
  );

  const onEditContribution = React.useCallback(
    (editContribution: PostType) => {
      dispatch({
        type: EditorActions.EDIT_TAGS,
        payload: {
          boardSlug,
          threadId,
          contributionId: editContribution.postId,
        },
      });
    },
    [boardSlug, threadId]
  );

  React.useEffect(() => {
    props.onTotalPostsChange(chronologicalPostsSequence.length);
  }, [chronologicalPostsSequence]);

  if (!currentRoot) {
    return <div />;
  }
  const url = new URL(`${window.location.origin}${router.asPath}`);
  return (
    <div className="thread-container">
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
      <NewThread
        onCollapseLevel={(levelId) => {
          setCollapse([...collapse, levelId]);
        }}
        onUncollapseLevel={(levelId) => {
          setCollapse(collapse.filter((id) => id != levelId));
        }}
        getCollapseReason={(levelId) => {
          return <div>Subthread manually hidden.</div>;
        }}
      >
        <ThreadLevel
          onEditPost={onEditContribution}
          onNewContribution={onNewContribution}
          onNewComment={onNewComment}
          post={currentRoot}
          postsMap={parentChildrenMap}
          isLoggedIn={isLoggedIn}
          collapsedIndents={collapse}
        />
      </NewThread>
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
        .thread-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default withThreadData(ThreadView);
