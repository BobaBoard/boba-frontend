import React from "react";
import { NewThread } from "@bobaboard/ui-components";
import ThreadPost, { scrollToPost } from "./ThreadPost";
import debug from "debug";
import { useThreadContext } from "components/thread/ThreadContext";
import { CommentType, PostType } from "../../types/Types";
import Link from "next/link";
import classnames from "classnames";
import CommentsThread from "./CommentsThread";
import { usePageDetails, ThreadPageDetails } from "utils/router-utils";
import { useAuth } from "components/Auth";
import { useStemOptions } from "components/hooks/useStemOptions";
import { useBoardContext } from "components/BoardContext";
import { useThreadEditors } from "components/editors/withEditors";
import { useCollapseManager } from "./useCollapseManager";

const log = debug("bobafrontend:ThreadLevel-log");
const info = debug("bobafrontend:ThreadLevel-info");

export const getCommentThreadId = (postId: string) => {
  return `${postId}_comment`;
};
export const extractPostId = (levelId: string) => {
  if (levelId.indexOf(`_comment`) === -1) {
    return levelId;
  }
  return levelId.substring(0, levelId.indexOf(`_comment`));
};

const ThreadLevel: React.FC<{
  post: PostType;
  isLoggedIn: boolean;
  lastOf?: { level: number; postId: string }[];
  showThread?: boolean;
  isCollapsed: (levelId: string) => boolean;
  onToggleCollapseLevel: (levelId: string) => void;
  toDisplay: (PostType | CommentType)[];
  collapseManager: ReturnType<typeof useCollapseManager>;
}> = (props) => {
  const {
    onNewComment,
    onNewContribution,
    onEditContribution,
  } = useThreadEditors();
  info(`Rendering subtree starting with post with id ${props.post.postId}`);
  const { parentChildrenMap } = useThreadContext();
  if (!props.toDisplay.includes(props.post)) {
    return null;
  }

  const hasNestedContributions = parentChildrenMap.has(props.post.postId);
  // When there's only comments replying to the post, then the indentation is just made of
  // the comments themselves.
  // If there's comments and contributions, then the contributions are indented immediately
  // underneath this post, and the comments thread, is another extra indent at the beginning
  // of the contributions indent.
  // It's easier to reason about this when realizing that comments can be collapsed independently
  // from other contributions, and thus need their own special "indent level".
  const commentsThread = (
    <NewThread.Indent
      id={
        hasNestedContributions
          ? getCommentThreadId(props.post.postId)
          : props.post.postId
      }
      collapsed={props.isCollapsed(
        hasNestedContributions
          ? getCommentThreadId(props.post.postId)
          : props.post.postId
      )}
    >
      <CommentsThread parentPostId={props.post.postId} />
    </NewThread.Indent>
  );

  const hasComments = !!props.post.comments?.length;
  const children = parentChildrenMap.get(props.post.postId)?.children;
  const childrenDisplay: React.ReactNode[] = [];
  for (let i = 0; i < (children?.length || 0); i++) {
    const currentPost = children![i];
    const collapseGroup = props.collapseManager.getCollapseGroup(
      currentPost.postId
    );
    if (collapseGroup) {
      const collapseGroupId = props.collapseManager.getCollapseGroupId(
        collapseGroup
      );
      const collapseGroupChildren = [];
      while (children![i].postId !== collapseGroup[1] && i < children!.length) {
        collapseGroupChildren.push(children![i]);
        i++;
      }
      childrenDisplay.push(
        <NewThread.CollapseGroup
          id={collapseGroupId}
          collapsed={props.collapseManager.isCollapsed(collapseGroupId)}
        >
          {collapseGroupChildren.map((post) => (
            <ThreadLevel key={post.postId} {...props} post={post} />
          ))}
        </NewThread.CollapseGroup>
      );
      continue;
    }
    childrenDisplay.push(
      <ThreadLevel key={currentPost.postId} {...props} post={currentPost} />
    );
  }
  return (
    <>
      <NewThread.Item key={props.post.postId}>
        {(setHandler, boundaryId) => (
          <>
            <div
              className={classnames("post", {
                "with-indent": parentChildrenMap.has(props.post.postId),
              })}
            >
              <ThreadPost
                post={props.post}
                isLoggedIn={props.isLoggedIn}
                onNewContribution={onNewContribution}
                onNewComment={onNewComment}
                onEditPost={onEditContribution}
                avatarRef={setHandler}
                onNotesClick={props.onToggleCollapseLevel}
              />
            </div>
            {!hasNestedContributions && hasComments && commentsThread}
            {hasNestedContributions && (
              <NewThread.Indent
                id={props.post.postId}
                collapsed={props.isCollapsed(props.post.postId)}
              >
                {hasComments && (
                  <NewThread.Item parentBoundary={boundaryId}>
                    {commentsThread}
                  </NewThread.Item>
                )}
                {childrenDisplay}
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
ThreadLevel.displayName = "MemoizedThreadLevel";

interface ThreadViewProps {
  onTotalPostsChange: (total: number) => void;
  displayAtMost: number;
  setDisplayAtMost: (
    newAmount: React.SetStateAction<number>,
    callback?: (state: number) => void
  ) => void;
  collapseManager: ReturnType<typeof useCollapseManager>;
}
const ThreadView: React.FC<ThreadViewProps> = (props) => {
  const {
    postId,
    threadBaseUrl,
    slug: boardSlug,
    threadId,
  } = usePageDetails<ThreadPageDetails>();
  const { isLoggedIn } = useAuth();
  const { onNewContribution } = useThreadEditors();
  const boardData = useBoardContext(boardSlug);
  const {
    currentRoot,
    threadDisplaySequence,
    isLoading,
    isRefetching,
  } = useThreadContext();
  log(`Rerendering ThreadView.`);
  info(threadDisplaySequence);

  const {
    onCollapseLevel,
    onUncollapseLevel,
    getCollapseReason,
    onToggleCollapseLevel,
    isCollapsed,
  } = props.collapseManager;

  const getStemOptions = useStemOptions({
    boardSlug,
    threadId,
    onCollapse: onCollapseLevel,
    onScrollTo: (levelId) => {
      if (!levelId) {
        return;
      }
      scrollToPost(extractPostId(levelId), boardData?.accentColor);
    },
    onReply: (levelId) => {
      if (!levelId) {
        return;
      }
      onNewContribution(extractPostId(levelId));
    },
  });

  const { onTotalPostsChange } = props;
  React.useEffect(() => {
    onTotalPostsChange(threadDisplaySequence.length);
    log(
      `Total post length changed. New Total: ${threadDisplaySequence.length}`
    );
  }, [threadDisplaySequence, onTotalPostsChange]);

  const { setDisplayAtMost } = props;
  React.useEffect(() => {
    if (isLoading || isRefetching) {
      return;
    }
    let id: number;
    let timeout: NodeJS.Timeout;
    const idleCallback = () => {
      log(`Browser idle (or equivalent). Loading more.....`);
      requestAnimationFrame(() =>
        setDisplayAtMost(
          (current) => current + 10,
          (newValue) => {
            log(
              `New total posts loaded: ${newValue}. Total posts: ${threadDisplaySequence.length}`
            );
            if (newValue < threadDisplaySequence.length) {
              timeout = setTimeout(() => {
                log(`Creating request for further load at next idle step.`);
                // @ts-ignore
                id = requestIdleCallback(idleCallback /*, { timeout: 2000 }*/);
              }, 5000);
            }
          }
        )
      );
    };
    // @ts-ignore
    requestIdleCallback(idleCallback /*, { timeout: 500 }*/);
    return () => {
      if (id) {
        // @ts-ignore
        cancelIdleCallback(id);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isLoading, isRefetching, threadDisplaySequence.length, setDisplayAtMost]);

  const toDisplay = threadDisplaySequence.filter(
    (value, index) => index < props.displayAtMost
  );

  log(`Displaying `);
  info(toDisplay);

  if (!currentRoot) {
    return <div />;
  }
  return (
    <div className="thread-container">
      <div
        className={classnames("whole-thread", {
          visible: !!postId,
        })}
      >
        <Link
          as={`${threadBaseUrl}${window.location.search}`}
          href={`/[boardId]/thread/[...threadId]`}
          shallow={true}
        >
          <a>Show whole thread</a>
        </Link>
      </div>
      <NewThread
        onCollapseLevel={onCollapseLevel}
        onUncollapseLevel={onUncollapseLevel}
        getCollapseReason={getCollapseReason}
        getStemOptions={getStemOptions}
      >
        <ThreadLevel
          post={currentRoot}
          isLoggedIn={isLoggedIn}
          onToggleCollapseLevel={onToggleCollapseLevel}
          isCollapsed={isCollapsed}
          toDisplay={toDisplay}
          collapseManager={props.collapseManager}
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

const MemoizedThreadView = React.memo(ThreadView);
MemoizedThreadView.whyDidYouRender = true;
export default MemoizedThreadView;
