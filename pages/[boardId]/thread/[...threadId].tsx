import React, { SetStateAction, useState } from "react";
import {
  FeedWithMenu,
  CycleNewButton,
  PostingActionButton,
} from "@bobaboard/ui-components";
import Layout from "components/Layout";
import LoadingSpinner from "components/LoadingSpinner";
import { useAuth } from "components/Auth";
import classnames from "classnames";
import { useBoardContext } from "components/BoardContext";
//import { useHotkeys } from "react-hotkeys-hook";
import ThreadView from "components/thread/ThreadView";
import { scrollToComment } from "components/thread/CommentsThread";
import { isPostLoaded, scrollToPost } from "components/thread/ThreadPost";
import ThreadSidebar from "components/thread/ThreadSidebar";
import GalleryThreadView from "components/thread/GalleryThreadView";
import TimelineThreadView from "components/thread/TimelineThreadView";
import ThreadContextProvider, {
  useThreadContext,
} from "components/thread/ThreadContext";
import { ThreadPageDetails, usePageDetails } from "../../../utils/router-utils";
import {
  THREAD_VIEW_MODES,
  useThreadView,
} from "components/thread/useThreadView";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useThreadEditors, withEditors } from "components/editors/withEditors";
import { useReadThread } from "components/hooks/queries/thread";
import { clearThreadData } from "utils/queries/cache";
import { useQueryClient } from "react-query";

import debug from "debug";
import { isPost, PostType } from "types/Types";
import {
  findFirstLevelParent,
  findNextSibling,
  findPreviousSibling,
} from "utils/thread-utils";
import { useCollapseManager } from "components/thread/useCollapseManager";
const error = debug("bobafrontend:ThreadPage-error");
const log = debug("bobafrontend:ThreadPage-log");
const info = debug("bobafrontend:ThreadPage-info");

const useStateWithCallback = <T extends any>(
  initialState: T
): [T, (value: SetStateAction<T>, callback?: (state: T) => void) => void] => {
  const callbackRef = React.useRef<(state: T) => void>(null);

  const [value, setValue] = React.useState(initialState);

  React.useEffect(() => {
    callbackRef.current?.(value);
    // @ts-ignore
    callbackRef.current = null;
  }, [value]);

  const setValueWithCallback = React.useCallback((newValue, callback) => {
    // @ts-ignore
    callbackRef.current = callback;

    return setValue(newValue);
  }, []);

  return [value, setValueWithCallback];
};

const MemoizedThreadSidebar = React.memo(ThreadSidebar);
const MemoizedThreadView = React.memo(ThreadView);
const MemoizedGalleryThreadView = React.memo(GalleryThreadView);
const MemoizedTimelineThreadView = React.memo(TimelineThreadView);

const READ_MORE_STEP = 5;
function ThreadPage() {
  const queryClient = useQueryClient();
  const { postId, slug, threadId } = usePageDetails<ThreadPageDetails>();
  const { isLoggedIn, isPending: isAuthPending } = useAuth();
  const { getLinkToBoard } = useCachedLinks();
  const currentBoardData = useBoardContext(slug);
  const [maxDisplay, setMaxDisplay] = useStateWithCallback(READ_MORE_STEP);
  const [totalPosts, setTotalPosts] = useState(Infinity);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const closeSidebar = React.useCallback(() => setShowSidebar(false), []);
  const onCompassClick = React.useCallback(() => setShowSidebar(!showSidebar), [
    showSidebar,
  ]);
  const markAsRead = useReadThread();
  const hasMarkedAsRead = React.useRef(false);
  const { currentThreadViewMode, setThreadViewMode } = useThreadView();
  const collapseManager = useCollapseManager();
  const {
    threadRoot,
    newRepliesSequence,
    chronologicalPostsSequence,
    threadDisplaySequence,
    postsInfoMap,
    postCommentsMap,
    isLoading: isFetchingThread,
    isRefetching: isRefetchingThread,
  } = useThreadContext();
  log(postsInfoMap);
  const { onNewContribution } = useThreadEditors();

  React.useEffect(() => {
    if (
      !isFetchingThread &&
      !isRefetchingThread &&
      isLoggedIn &&
      !hasMarkedAsRead.current
    ) {
      markAsRead({ slug, threadId });
      hasMarkedAsRead.current = true;
      return;
    }
  }, [
    markAsRead,
    isFetchingThread,
    isRefetchingThread,
    isLoggedIn,
    slug,
    threadId,
  ]);

  React.useEffect(() => {
    return () => {
      if (!threadId || !slug) {
        return;
      }
      clearThreadData(queryClient, { slug, threadId });
      hasMarkedAsRead.current = false;
    };
  }, []);

  const newRepliesIndex = React.useRef<number>(-1);
  React.useEffect(() => {
    //setMaxDisplay(READ_MORE_STEP);
  }, [currentThreadViewMode, setMaxDisplay, collapseManager]);

  // TODO: disable this while post editing and readd
  // const currentPostIndex = React.useRef<number>(-1);
  // useHotkeys(
  //   "n",
  //   () => {
  //     if (!postsDisplaySequence) {
  //       return;
  //     }
  //     currentPostIndex.current =
  //       (currentPostIndex.current + 1) % postsDisplaySequence.length;
  //     scrollToPost(
  //       postsDisplaySequence[currentPostIndex.current].postId,
  //       boardData.accentColor
  //     );
  //   },
  //   [postsDisplaySequence]
  // );

  React.useEffect(() => {
    if (currentBoardData?.loggedInOnly && !isAuthPending && !isLoggedIn) {
      // TODO: this happens after the thread has already 403'd
      getLinkToBoard(slug).onClick?.();
    }
  }, [currentBoardData, isAuthPending, isLoggedIn]);

  // Skip if there's only one new post and it's the root.
  const hasBeamableReply =
    newRepliesSequence?.length &&
    !(newRepliesSequence.length == 1 && newRepliesSequence[0] === threadRoot);
  const onNewAnswersButtonClick = () => {
    if (!hasBeamableReply) {
      return;
    }

    log(`Finding next new reply...`);
    // @ts-ignore
    newRepliesIndex.current =
      (newRepliesIndex.current + 1) % newRepliesSequence.length;
    let next = newRepliesSequence[newRepliesIndex.current];
    // Skip the root post.
    if (isPost(next) && next.parentPostId == null) {
      newRepliesIndex.current =
        (newRepliesIndex.current + 1) % newRepliesSequence.length;
      // This won't be the root, cause we already addressed the case when the root is the only
      // new post.
      next = newRepliesSequence[newRepliesIndex.current];
      info(`...skipping the root...`);
    }
    log(`Beaming to new reply with index ${newRepliesIndex}`);
    info(newRepliesSequence);
    if (isPost(next)) {
      if (isPostLoaded(next.postId)) {
        scrollToPost(next.postId, currentBoardData?.accentColor || "#f96680");
      } else {
        const index = threadDisplaySequence.findIndex(
          (post) => post.postId == next.postId
        );
        const lastCurrentlyDisplayedIndex = Math.min(
          maxDisplay,
          chronologicalPostsSequence.length - 1
        );
        // see if the post is beyond the currently displayed
        // TODO this actually should never happen because in that case it would be displayed
        if (index < lastCurrentlyDisplayedIndex) {
          error("what the fuck");
          scrollToPost(next.postId, currentBoardData?.accentColor || "#f96680");
          return;
        }
        const lastCurrentlyDisplayed = threadDisplaySequence[
          lastCurrentlyDisplayedIndex
        ] as PostType;
        info(`The last post displayed is: ${lastCurrentlyDisplayed}`);

        const lastFirstLevelParent = findFirstLevelParent(
          lastCurrentlyDisplayed,
          postsInfoMap
        );
        const firstCollapsedLvl1 = findNextSibling(
          lastFirstLevelParent,
          postsInfoMap
        );
        const nextFirstLevelParent = findFirstLevelParent(next, postsInfoMap);
        const lastCollapsedLvl1 = findPreviousSibling(
          nextFirstLevelParent,
          postsInfoMap
        );
        collapseManager.addCollapseGroup(
          firstCollapsedLvl1!.postId,
          lastCollapsedLvl1!.postId
        );
        collapseManager.onCollapseLevel(
          collapseManager.getCollapseGroupId([
            firstCollapsedLvl1!.postId,
            lastCollapsedLvl1!.postId,
          ])
        );
        log(
          `Adding collapse group: [${firstCollapsedLvl1!.postId}, ${
            lastCollapsedLvl1!.postId
          }]`
        );
        setMaxDisplay(index + 1, () => {
          scrollToPost(next.postId, currentBoardData?.accentColor || "#f96680");
        });
      }
    }
    // isPost(next)
    //   ?
    //   : scrollToComment(
    //       next.commentId,
    //       currentBoardData?.accentColor || "#f96680"
    //     );
  };

  const canTopLevelPost =
    isLoggedIn &&
    (currentThreadViewMode == THREAD_VIEW_MODES.MASONRY ||
      currentThreadViewMode == THREAD_VIEW_MODES.TIMELINE);
  return (
    <div className="main">
      <Layout
        title={`!${slug}`}
        loading={isFetchingThread}
        onCompassClick={onCompassClick}
      >
        <Layout.MainContent>
          <FeedWithMenu
            showSidebar={showSidebar}
            onCloseSidebar={closeSidebar}
            reachToBottom={maxDisplay < totalPosts}
            onReachEnd={React.useCallback(
              (more) => {
                setMaxDisplay(
                  (maxDisplay) => maxDisplay + READ_MORE_STEP,
                  (maxDisplay) => {
                    more(maxDisplay < totalPosts);
                  }
                );
              },
              [setMaxDisplay, totalPosts]
            )}
          >
            <FeedWithMenu.Sidebar>
              <MemoizedThreadSidebar
                viewMode={currentThreadViewMode}
                open={showSidebar}
                onViewChange={setThreadViewMode}
                displayAtMost={maxDisplay}
                totalPosts={totalPosts}
              />
            </FeedWithMenu.Sidebar>
            <FeedWithMenu.FeedContent>
              <div
                className={classnames("feed", {
                  loading: isFetchingThread || isRefetchingThread,
                })}
              >
                <div className="view-modes">
                  {currentThreadViewMode == THREAD_VIEW_MODES.THREAD ||
                  postId ? (
                    <MemoizedThreadView
                      onTotalPostsChange={setTotalPosts}
                      displayAtMost={maxDisplay}
                      setDisplayAtMost={setMaxDisplay}
                      collapseManager={collapseManager}
                    />
                  ) : currentThreadViewMode == THREAD_VIEW_MODES.MASONRY ? (
                    <MemoizedGalleryThreadView
                      displayAtMost={maxDisplay}
                      onTotalPostsChange={setTotalPosts}
                    />
                  ) : (
                    <MemoizedTimelineThreadView
                      displayAtMost={maxDisplay}
                      onTotalPostsChange={setTotalPosts}
                    />
                  )}
                </div>
              </div>
              <LoadingSpinner
                loading={isFetchingThread || isRefetchingThread}
                idleMessage={
                  // Check whether there's more posts to display
                  maxDisplay < totalPosts
                    ? "..."
                    : currentThreadViewMode == THREAD_VIEW_MODES.THREAD
                    ? ""
                    : "Nothing more to load."
                }
                loadingMessage="~*loading*~"
              />
            </FeedWithMenu.FeedContent>
          </FeedWithMenu>
        </Layout.MainContent>
        <Layout.ActionButton>
          {currentThreadViewMode == THREAD_VIEW_MODES.THREAD &&
          hasBeamableReply ? (
            <CycleNewButton text="Next New" onNext={onNewAnswersButtonClick} />
          ) : canTopLevelPost ? (
            <PostingActionButton
              accentColor={currentBoardData?.accentColor || "#f96680"}
              onNewPost={() =>
                threadRoot && onNewContribution(threadRoot.postId)
              }
            />
          ) : undefined}
        </Layout.ActionButton>
      </Layout>
      <style jsx>
        {`
          .feed {
            width: 100%;
            max-width: 100%;
            position: relative;
            box-sizing: border-box;
          }
          .feed.loading .view-modes {
            display: none;
          }
        `}
      </style>
    </div>
  );
}

const ThreadPageWithContext: React.FC<Record<string, never>> = () => {
  const { postId, slug, threadId } = usePageDetails<ThreadPageDetails>();
  return (
    <ThreadContextProvider postId={postId} slug={slug} threadId={threadId}>
      <ThreadPage />
    </ThreadContextProvider>
  );
};

export default withEditors(ThreadPageWithContext);
