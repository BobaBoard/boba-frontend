import {
  CollapseManager,
  extractPostId,
  getCommentThreadId,
  useThreadCollapseManager,
} from "./useCollapseManager";
import { CommentType, PostType } from "types/Types";
import { DefaultTheme, LoadingBar, NewThread } from "@bobaboard/ui-components";
import {
  DisplayManager,
  READ_MORE_STEP,
} from "components/hooks/useDisplayMananger";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import ThreadPost, { scrollToPost } from "./ThreadPost";

import CommentsThread from "./CommentsThread";
import Link from "next/link";
import React from "react";
import classnames from "classnames";
import css from "styled-jsx/css";
import debug from "debug";
import { getCurrentSearchParams } from "utils/location-utils";
import { useAuth } from "components/Auth";
import { useBoardSummaryBySlug } from "queries/board";
import { useStemOptions } from "components/hooks/useStemOptions";
import { useThreadContext } from "components/thread/ThreadContext";
import { useThreadEditors } from "components/editors/withEditors";

const error = debug("bobafrontend:ThreadLevel-log");
const log = debug("bobafrontend:ThreadLevel-log");
const info = debug("bobafrontend:ThreadLevel-info");

const loadingBar = css.resolve`
  @keyframes delayDisplay {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .thread-loading-bar {
    top: ${DefaultTheme.HEADER_HEIGHT_PX}px!important;
    position: fixed;
    transition: visibility 800ms ease-out;
    opacity: 0;
  }
  .thread-loading-bar:not(.visible) {
    visibility: hidden;
  }
  .thread-loading-bar.visible {
    visibility: visible;
    z-index: 10 !important;
    animation-name: delayDisplay;
    animation-duration: 0.5s;
    animation-delay: 1.5s;
    animation-fill-mode: both;
  }
`;

const CollapseGroupDisplay: React.FC<{
  parentPostId: string;
  collapseGroupData: NonNullable<
    ReturnType<
      ReturnType<typeof useThreadCollapseManager>["getCollapseGroupAt"]
    >
  >;
  collapseManager: ReturnType<typeof useThreadCollapseManager>;
  toDisplay: (PostType | CommentType)[];
}> = ({ parentPostId, collapseGroupData, collapseManager, toDisplay }) => {
  const { parentChildrenMap } = useThreadContext();
  const children = parentChildrenMap.get(parentPostId)?.children;
  const { firstElement, lastElement, collapseGroupId, totals } =
    collapseGroupData;
  const firstElementIndex = children?.findIndex(
    (post) => post.postId == firstElement
  );
  const lastElementIndex = children?.findIndex(
    (post) => post.postId == lastElement
  );

  info(`Rendering collapse group:`, collapseGroupData);
  info(
    `Collapse group is ${
      collapseManager.isCollapsed(collapseGroupId) ? "collapsed" : "UNcollapsed"
    }.`
  );
  const { onPartiallyUncollapseGroup } = collapseManager;
  const loadBefore = React.useCallback(
    (groupId) => {
      onPartiallyUncollapseGroup(groupId, false);
    },
    [onPartiallyUncollapseGroup]
  );
  const loadAfter = React.useCallback(
    (groupId) => {
      onPartiallyUncollapseGroup(groupId, true);
    },
    [onPartiallyUncollapseGroup]
  );

  if (!firstElementIndex || !lastElementIndex) {
    error(
      `Found collapse group with invalid indexed: [${firstElementIndex}, ${lastElementIndex}`
    );
    return null;
  }
  const hasStaggeredLoading =
    totals?.totalPosts && totals?.totalPosts > READ_MORE_STEP;

  return (
    <div className="collapseGroup">
      <NewThread.CollapseGroup
        id={collapseGroupId}
        collapsed={collapseManager.isCollapsed(collapseGroupId)}
        onLoadAfter={hasStaggeredLoading ? loadAfter : undefined}
        onLoadBefore={hasStaggeredLoading ? loadBefore : undefined}
      >
        {children?.slice(firstElementIndex, lastElementIndex).map((post) => (
          <ThreadLevel
            key={post.postId}
            post={post}
            toDisplay={toDisplay}
            collapseManager={collapseManager}
          />
        ))}
      </NewThread.CollapseGroup>
      <style jsx>{`
        .collapseGroup {
          margin-top: 30px;
        }
      `}</style>
    </div>
  );
};

const ThreadLevel: React.FC<{
  post: PostType;
  showThread?: boolean;
  toDisplay: (PostType | CommentType)[];
  collapseManager: ReturnType<typeof useThreadCollapseManager>;
}> = (props) => {
  const { onNewComment, onNewContribution, onEditContribution } =
    useThreadEditors();
  const { isLoggedIn } = useAuth();
  //info(`Rendering subtree starting with post with id ${props.post.postId}`);
  const { parentChildrenMap, postCommentsMap } = useThreadContext();
  if (!props.toDisplay.includes(props.post)) {
    return null;
  }

  log(`Rendering post with id ${props.post.postId}`);
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
      collapsed={props.collapseManager.isCollapsed(
        hasNestedContributions
          ? getCommentThreadId(props.post.postId)
          : props.post.postId
      )}
    >
      <CommentsThread parentPostId={props.post.postId} />
    </NewThread.Indent>
  );

  const hasComments = !!postCommentsMap.get(props.post.postId)?.total;
  const children = parentChildrenMap.get(props.post.postId)?.children;
  const childrenDisplay: React.ReactNode[] = [];
  for (let i = 0; i < (children?.length || 0); i++) {
    const currentPost = children![i];
    const collapseGroupData = props.collapseManager.getCollapseGroupAt(
      currentPost.postId
    );
    if (collapseGroupData) {
      childrenDisplay.push(
        <CollapseGroupDisplay
          key={collapseGroupData.collapseGroupId}
          collapseGroupData={collapseGroupData}
          collapseManager={props.collapseManager}
          toDisplay={props.toDisplay}
          parentPostId={props.post.postId}
        />
      );
      i =
        children?.findIndex(
          (child) => child.postId === collapseGroupData?.lastElement
        ) || Infinity;
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
                isLoggedIn={isLoggedIn}
                onNewContribution={onNewContribution}
                onNewComment={onNewComment}
                onEditPost={onEditContribution}
                avatarRef={setHandler}
                onNotesClick={props.collapseManager.onToggleCollapseLevel}
              />
            </div>
            {!hasNestedContributions && hasComments && commentsThread}
            {hasNestedContributions && (
              <NewThread.Indent
                id={props.post.postId}
                collapsed={props.collapseManager.isCollapsed(props.post.postId)}
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
  displayManager: DisplayManager;
  collapseManager: CollapseManager;
}
const ThreadView: React.FC<ThreadViewProps> = (props) => {
  const {
    postId,
    threadBaseUrl,
    slug: boardSlug,
    threadId,
  } = usePageDetails<ThreadPageDetails>();
  const { onNewContribution } = useThreadEditors();
  const boardData = useBoardSummaryBySlug(boardSlug);
  const { currentRoot } = useThreadContext();
  log(`Rerendering ThreadView.`);

  const { onCollapseLevel, onUncollapseLevel, getCollapseReason } =
    props.collapseManager;

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

  if (!currentRoot) {
    return <div />;
  }
  const { currentModeLoadedElements, currentModeDisplayElements } =
    props.displayManager;
  return (
    <div className="thread-container">
      <LoadingBar
        className={classnames("thread-loading-bar", loadingBar.className, {
          visible:
            currentModeLoadedElements.length !==
            currentModeDisplayElements.length,
        })}
        accentColor={boardData?.accentColor}
        label={"thread load percentage"}
        // TODO: readd progress here.
        // progress={
        //   (currentModeLoadedElements.length * 100) /
        //   currentModeDisplayElements.length
        // }
      />
      <div
        className={classnames("whole-thread", {
          visible: !!postId,
        })}
      >
        <Link
          as={`${threadBaseUrl}${getCurrentSearchParams()}`}
          href={`/[boardId]/thread/[...threadId]`}
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
          toDisplay={currentModeLoadedElements}
          collapseManager={props.collapseManager}
        />
      </NewThread>
      {loadingBar.styles}
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
ThreadView.whyDidYouRender = true;
export default MemoizedThreadView;
