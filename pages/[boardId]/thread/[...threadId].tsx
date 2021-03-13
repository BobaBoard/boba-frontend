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
import { useBeamToNew } from "components/hooks/useBeamToNew";
import { useDisplayManager } from "components/hooks/useDisplayMananger";
import { useThreadEditors, withEditors } from "components/editors/withEditors";
import { useReadThread } from "components/hooks/queries/thread";
import { clearThreadData } from "utils/queries/cache";
import { useQueryClient } from "react-query";

import debug from "debug";
import { useThreadCollapseManager } from "components/thread/useCollapseManager";
const error = debug("bobafrontend:ThreadPage-error");
const log = debug("bobafrontend:ThreadPage-log");
const info = debug("bobafrontend:ThreadPage-info");

const MemoizedThreadSidebar = React.memo(ThreadSidebar);
const MemoizedThreadView = React.memo(ThreadView);
const MemoizedGalleryThreadView = React.memo(GalleryThreadView);
const MemoizedTimelineThreadView = React.memo(TimelineThreadView);

function ThreadPage() {
  const queryClient = useQueryClient();
  const { postId, slug, threadId } = usePageDetails<ThreadPageDetails>();
  const { isLoggedIn, isPending: isAuthPending } = useAuth();
  const { getLinkToBoard } = useCachedLinks();
  const currentBoardData = useBoardContext(slug);
  const [totalPosts, setTotalPosts] = useState(Infinity);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const closeSidebar = React.useCallback(() => setShowSidebar(false), []);
  const onCompassClick = React.useCallback(() => setShowSidebar(!showSidebar), [
    showSidebar,
  ]);
  const markAsRead = useReadThread();
  const hasMarkedAsRead = React.useRef(false);
  const { currentThreadViewMode, setThreadViewMode } = useThreadView();
  const collapseManager = useThreadCollapseManager();
  const {
    threadRoot,
    isLoading: isFetchingThread,
    isRefetching: isRefetchingThread,
  } = useThreadContext();
  const displayManager = useDisplayManager(currentThreadViewMode);
  const { displayMore } = displayManager;
  const { hasBeamToNew, onNewAnswersButtonClick } = useBeamToNew(
    collapseManager,
    displayManager,
    currentBoardData?.accentColor
  );
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
  }, [queryClient, slug, threadId]);

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
  }, [currentBoardData, isAuthPending, isLoggedIn, getLinkToBoard, slug]);

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
            reachToBottom={displayManager.hasMore()}
            onReachEnd={React.useCallback(
              (more) =>
                displayMore((_, hasMore) => {
                  more(hasMore);
                }),
              [displayMore]
            )}
          >
            <FeedWithMenu.Sidebar>
              <MemoizedThreadSidebar
                viewMode={currentThreadViewMode}
                open={showSidebar}
                onViewChange={setThreadViewMode}
                displayManager={displayManager}
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
                      displayManager={displayManager}
                      collapseManager={collapseManager}
                    />
                  ) : currentThreadViewMode == THREAD_VIEW_MODES.MASONRY ? (
                    <MemoizedGalleryThreadView
                      displayManager={displayManager}
                      onTotalPostsChange={setTotalPosts}
                    />
                  ) : (
                    <MemoizedTimelineThreadView
                      displayManager={displayManager}
                      onTotalPostsChange={setTotalPosts}
                    />
                  )}
                </div>
              </div>
              <LoadingSpinner
                loading={isFetchingThread || isRefetchingThread}
                idleMessage={
                  // Check whether there's more posts to display
                  displayManager.hasMore()
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
          {currentThreadViewMode == THREAD_VIEW_MODES.THREAD && hasBeamToNew ? (
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
