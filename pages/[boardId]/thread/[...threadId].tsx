import React from "react";
import {
  FeedWithMenu,
  CycleNewButton,
  PostingActionButton,
} from "@bobaboard/ui-components";
import Layout from "components/layout/Layout";
import LoadingSpinner from "components/LoadingSpinner";
import { useAuth } from "components/Auth";
import classnames from "classnames";
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
  ThreadViewContextProvider,
  THREAD_VIEW_MODES,
  useThreadViewContext,
} from "components/thread/ThreadViewContext";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useBeamToNew } from "components/hooks/useBeamToNew";
import { useDisplayManager } from "components/hooks/useDisplayMananger";
import { useThreadEditors, withEditors } from "components/editors/withEditors";
import { useReadThread } from "components/hooks/queries/thread";
import { useThreadCollapseManager } from "components/thread/useCollapseManager";
import { useInvalidateNotifications } from "components/hooks/queries/notifications";
import { useBoardSummary } from "contexts/RealmContext";

// import debug from "debug";
// const error = debug("bobafrontend:ThreadPage-error");
// const log = debug("bobafrontend:ThreadPage-log");
// const info = debug("bobafrontend:ThreadPage-info");

const MemoizedThreadSidebar = React.memo(ThreadSidebar);
const MemoizedThreadView = React.memo(ThreadView);
const MemoizedGalleryThreadView = React.memo(GalleryThreadView);
const MemoizedTimelineThreadView = React.memo(TimelineThreadView);

function ThreadPage() {
  const { postId, slug, threadId } = usePageDetails<ThreadPageDetails>();
  const { isLoggedIn, isPending: isAuthPending } = useAuth();
  const { getLinkToBoard } = useCachedLinks();
  const currentBoardData = useBoardSummary({ boardId: slug });
  const refetchNotifications = useInvalidateNotifications();
  const [showSidebar, setShowSidebar] = React.useState(false);
  const closeSidebar = React.useCallback(() => setShowSidebar(false), []);
  const onCompassClick = React.useCallback(
    () => setShowSidebar(!showSidebar),
    [showSidebar]
  );
  const markAsRead = useReadThread({ activityOnly: true });
  const hasMarkedAsRead = React.useRef(false);
  const { currentThreadViewMode, setThreadViewMode } = useThreadViewContext();
  const collapseManager = useThreadCollapseManager();
  const {
    threadRoot,
    isLoading: isFetchingThread,
    isRefetching: isRefetchingThread,
  } = useThreadContext();
  const displayManager = useDisplayManager(collapseManager);
  const { displayMore } = displayManager;
  const { hasBeamToNew, onNewAnswersButtonClick, loading } = useBeamToNew(
    displayManager,
    currentBoardData?.accentColor
  );
  const { onNewContribution } = useThreadEditors();

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (
      !isFetchingThread &&
      !isRefetchingThread &&
      isLoggedIn &&
      !hasMarkedAsRead.current
    ) {
      timeout = setTimeout(() => {
        markAsRead({ slug, threadId });
        hasMarkedAsRead.current = true;
        refetchNotifications();
      }, 1500);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [
    markAsRead,
    refetchNotifications,
    isFetchingThread,
    isRefetchingThread,
    isLoggedIn,
    slug,
    threadId,
  ]);

  // Make sure that the thread is marked as read again if the page changes.
  React.useEffect(() => {
    return () => {
      if (!threadId || !slug || !hasMarkedAsRead.current) {
        return;
      }
      hasMarkedAsRead.current = false;
    };
  }, [slug, threadId]);

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
                    />
                  ) : (
                    <MemoizedTimelineThreadView
                      displayManager={displayManager}
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
            <CycleNewButton
              text="Next New"
              onNext={onNewAnswersButtonClick}
              loading={loading}
            />
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
      <ThreadViewContextProvider>
        <ThreadPage />
      </ThreadViewContextProvider>
    </ThreadContextProvider>
  );
};

export default withEditors(ThreadPageWithContext);
