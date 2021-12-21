import {
  CycleNewButton,
  FeedWithMenu,
  PostingActionButton,
  getDeltaSummary,
} from "@bobaboard/ui-components";
import {
  THREAD_VIEW_MODES,
  ThreadViewContextProvider,
  useThreadViewContext,
} from "components/thread/ThreadViewContext";
import ThreadContextProvider, {
  useInvalidateThreadData,
  useThreadContext,
} from "components/thread/ThreadContext";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import { useBoardSummary, useRealmBoardId } from "contexts/RealmContext";
import { useThreadEditors, withEditors } from "components/editors/withEditors";

import GalleryThreadView from "components/thread/GalleryThreadView";
import Layout from "components/layout/Layout";
import LoadingSpinner from "components/LoadingSpinner";
import { NextPageContext } from "next";
import React from "react";
import ThreadSidebar from "components/thread/ThreadSidebar";
//import { useHotkeys } from "react-hotkeys-hook";
import ThreadView from "components/thread/ThreadView";
import TimelineThreadView from "components/thread/TimelineThreadView";
import axios from "axios";
import classnames from "classnames";
import debug from "debug";
import { getServerBaseUrl } from "utils/location-utils";
import { makeClientThread } from "utils/client-data";
import { useAuth } from "components/Auth";
import { useBeamToNew } from "components/hooks/useBeamToNew";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useDisplayManager } from "components/hooks/useDisplayMananger";
import { useInvalidateNotifications } from "queries/notifications";
import { useOnPageExit } from "components/hooks/useOnPageExit";
import { useReadThread } from "queries/thread";
import { useRefetchBoardActivity } from "queries/board-feed";
import { useThreadCollapseManager } from "components/thread/useCollapseManager";

const error = debug("bobafrontend:ThreadPage-error");
const log = debug("bobafrontend:ThreadPage-log");
log.enabled = true;
// const info = debug("bobafrontend:ThreadPage-info");

const MemoizedThreadView = React.memo(ThreadView);
const MemoizedGalleryThreadView = React.memo(GalleryThreadView);
const MemoizedTimelineThreadView = React.memo(TimelineThreadView);

export const MARK_THREAD_READ_DELAY = 1000;
const useMarkThreadReadOnDelay = (threadId: string, slug: string) => {
  const boardId = useRealmBoardId({ realmSlug: "v0", boardSlug: slug });
  // The latest threadId that was marked as read. When this changes, we need to
  // mark the thread as read again.
  const latestReadThread = React.useRef<string | null>(null);
  const markReadTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const invalidateThread = useInvalidateThreadData();
  const refetchNotifications = useInvalidateNotifications();
  const refetchBoardActivity = useRefetchBoardActivity();
  const markAsRead = useReadThread({ activityOnly: true });
  const { isLoggedIn } = useAuth();
  const { isLoading: isFetchingThread, isRefetching: isRefetchingThread } =
    useThreadContext();

  useOnPageExit(
    React.useCallback(() => {
      log(
        "Exiting current thread, invalidating it and restoring mark as read."
      );
      if (markReadTimeout.current) {
        clearTimeout(markReadTimeout.current);
        markReadTimeout.current = null;
      }
      if (!latestReadThread.current || latestReadThread.current === threadId) {
        return;
      }
      invalidateThread({ threadId: latestReadThread.current });
      latestReadThread.current = null;
    }, [threadId, invalidateThread])
  );

  React.useEffect(() => {
    if (
      isFetchingThread ||
      isRefetchingThread ||
      !isLoggedIn ||
      !threadId ||
      latestReadThread.current == threadId ||
      markReadTimeout.current
    ) {
      // The thread is either still loading, or we've already marked it as read
      // (or are in the process of doing so).
      log("Skip marking thread as read (for now).");
      return;
    }

    markReadTimeout.current = setTimeout(() => {
      if (latestReadThread.current == threadId) {
        // This ensures we only mark as read once per thread.
        log("Marking thread as read already scheduled. Bailing.");
        return;
      }
      latestReadThread.current = threadId;
      markAsRead(
        { boardId: boardId!, threadId },
        {
          onSuccess: () => {
            log("Thread marked as read.");
            markReadTimeout.current = null;
            refetchNotifications();
            refetchBoardActivity({ boardId });
          },
          onError: () => {
            latestReadThread.current = null;
          },
        }
      );
    }, MARK_THREAD_READ_DELAY);
  }, [
    markAsRead,
    refetchNotifications,
    refetchBoardActivity,
    isFetchingThread,
    isRefetchingThread,
    isLoggedIn,
    boardId,
    threadId,
  ]);
};

function ThreadPage() {
  const { postId, slug, threadId } = usePageDetails<ThreadPageDetails>();
  const boardId = useRealmBoardId({ realmSlug: "v0", boardSlug: slug });
  const { isLoggedIn, isPending: isAuthPending } = useAuth();
  const { getLinkToBoard } = useCachedLinks();
  const currentBoardData = useBoardSummary({ boardId });
  const [showSidebar, setShowSidebar] = React.useState(false);
  const closeSidebar = React.useCallback(() => setShowSidebar(false), []);
  const onCompassClick = React.useCallback(
    () => setShowSidebar(!showSidebar),
    [showSidebar]
  );
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
  useMarkThreadReadOnDelay(threadId, slug);

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
              <ThreadSidebar
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

const ThreadPageWithContext: React.FC<{
  summary?: ReturnType<typeof getDeltaSummary>;
}> = () => {
  const { postId, slug, threadId } = usePageDetails<ThreadPageDetails>();
  const boardId = useRealmBoardId({ boardSlug: slug, realmSlug: "v0" });
  return (
    <ThreadContextProvider
      postId={postId}
      boardId={boardId}
      threadId={threadId}
    >
      <ThreadViewContextProvider>
        <ThreadPage />
      </ThreadViewContextProvider>
    </ThreadContextProvider>
  );
};

const ThreadWithEditors = withEditors(ThreadPageWithContext);
export default ThreadWithEditors;

// @ts-expect-error
ThreadWithEditors.getInitialProps = async (ctx: NextPageContext) => {
  try {
    if (!ctx.query.threadId?.length) {
      return {};
    }
    const response = await axios.get(
      getServerBaseUrl(ctx) + `threads/${ctx.query.threadId[0]}/`
    );
    const thread = makeClientThread(await response.data);

    if (!thread) {
      return {};
    }
    const summary = getDeltaSummary(JSON.parse(thread.starter.content));
    return {
      summary,
    };
  } catch (e) {
    error(e);
    return {};
  }
};
