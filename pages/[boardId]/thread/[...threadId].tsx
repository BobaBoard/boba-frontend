import {
  CycleNewButton,
  FeedWithMenu,
  PostingActionButton,
  getDeltaSummary,
} from "@bobaboard/ui-components";
import { THREAD_QUERY_KEY, useReadThread } from "queries/thread";
import {
  THREAD_VIEW_MODE,
  ThreadViewContextProvider,
  useThreadViewContext,
} from "contexts/ThreadViewContext";
import ThreadContextProvider, {
  useInvalidateThreadData,
  useThreadContext,
} from "components/thread/ThreadContext";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import {
  useBoardSummary,
  useCurrentRealmBoardId,
  useRealmPermissions,
} from "contexts/RealmContext";
import { useThreadEditors, withEditors } from "components/editors/withEditors";

import GalleryThreadView from "components/thread/GalleryThreadView";
import Layout from "components/layout/Layout";
import LoadingSpinner from "components/LoadingSpinner";
import { NextPage } from "next";
import { PageContextWithQueryClient } from "additional";
import React from "react";
import { RealmPermissions } from "types/Types";
import ThreadSidebar from "components/thread/ThreadSidebar";
//import { useHotkeys } from "react-hotkeys-hook";
import ThreadView from "components/thread/ThreadView";
import TimelineThreadView from "components/thread/TimelineThreadView";
import classnames from "classnames";
import debug from "debug";
import { getThreadData } from "utils/queries/thread";
import { isClientContext } from "utils/location-utils";
import { useAuth } from "components/Auth";
import { useBeamToElement } from "components/hooks/useBeamToElement";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useDisplayManager } from "components/hooks/useDisplayMananger";
import { useEditorsState } from "components/editors/EditorsContext";
import { useInvalidateNotifications } from "queries/notifications";
import { useOnPageExit } from "components/hooks/useOnPageExit";
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
  const boardId = useCurrentRealmBoardId({ boardSlug: slug });
  // The latest threadId that was marked as read. When this changes, we need to
  // mark the thread as read again.
  const latestReadThread = React.useRef<string | null>(null);
  const markReadTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const invalidateThread = useInvalidateThreadData();
  const refetchNotifications = useInvalidateNotifications();
  const refetchBoardActivity = useRefetchBoardActivity();
  const markAsRead = useReadThread({ activityOnly: true });
  const { isLoggedIn } = useAuth();
  const { isFetching: isFetchingThread } = useThreadContext();

  // When we exit the thread, we must "restart" the timeout for mark has read and
  // remove the thread from the cache.
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

  // Mark the thread as read after a delay
  React.useEffect(() => {
    if (
      isFetchingThread ||
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
    isLoggedIn,
    boardId,
    threadId,
  ]);
};

function ThreadPage() {
  const { postId, slug, threadId, commentId } =
    usePageDetails<ThreadPageDetails>();
  const boardId = useCurrentRealmBoardId({ boardSlug: slug });
  const realmPermissions = useRealmPermissions();
  const editorState = useEditorsState();
  const { isPending: isAuthPending } = useAuth();
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
  const { threadRoot, isFetching: isFetchingThread } = useThreadContext();
  const displayManager = useDisplayManager(collapseManager);
  const { displayMore } = displayManager;
  const { hasBeamToNew, onNewAnswersButtonClick, loading } = useBeamToElement(
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
    if (
      currentBoardData?.loggedInOnly &&
      !isAuthPending &&
      !realmPermissions.includes(RealmPermissions.ACCESS_LOCKED_BOARDS_ON_REALM)
    ) {
      // TODO: this happens after the thread has already 403'd
      getLinkToBoard(slug).onClick?.();
    }
  }, [currentBoardData, isAuthPending, realmPermissions, getLinkToBoard, slug]);

  const canTopLevelPost =
    realmPermissions.includes(RealmPermissions.POST_ON_REALM) &&
    (currentThreadViewMode == THREAD_VIEW_MODE.MASONRY ||
      currentThreadViewMode == THREAD_VIEW_MODE.TIMELINE);

  const displayThreadView =
    currentThreadViewMode == THREAD_VIEW_MODE.THREAD || postId || commentId;
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
                  loading: isFetchingThread,
                })}
              >
                <div className="view-modes">
                  {displayThreadView ? (
                    <MemoizedThreadView
                      displayManager={displayManager}
                      collapseManager={collapseManager}
                    />
                  ) : currentThreadViewMode == THREAD_VIEW_MODE.MASONRY ? (
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
                loading={isFetchingThread}
                idleMessage={
                  // Check whether there's more posts to display
                  displayManager.hasMore()
                    ? "..."
                    : currentThreadViewMode == THREAD_VIEW_MODE.THREAD
                    ? ""
                    : "Nothing more to load."
                }
                loadingMessage="~*loading*~"
              />
            </FeedWithMenu.FeedContent>
          </FeedWithMenu>
        </Layout.MainContent>
        <Layout.ActionButton>
          {currentThreadViewMode == THREAD_VIEW_MODE.THREAD && hasBeamToNew ? (
            <CycleNewButton
              text="Next New"
              onNext={onNewAnswersButtonClick}
              loading={loading}
            />
          ) : canTopLevelPost && !editorState.isOpen ? (
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
        `}
      </style>
    </div>
  );
}

const ThreadPageWithContext: React.FC<{
  summary?: ReturnType<typeof getDeltaSummary>;
}> = () => {
  const { postId, slug, threadId, commentId } =
    usePageDetails<ThreadPageDetails>();
  const boardId = useCurrentRealmBoardId({ boardSlug: slug });
  return (
    <ThreadContextProvider
      commentId={commentId}
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

const ThreadWithEditors: NextPage = withEditors(ThreadPageWithContext);
export default ThreadWithEditors;

ThreadWithEditors.getInitialProps = async (ctx: PageContextWithQueryClient) => {
  if (isClientContext(ctx)) {
    // See _app.tsx on why this is necessary
    return {};
  }
  try {
    if (!ctx.query.threadId?.length) {
      return {};
    }
    const threadId = ctx.query.threadId[0];
    const postId = ctx.query.threadId[1];
    const thread = await getThreadData({ threadId });

    if (!thread) {
      return {};
    }

    await ctx.queryClient.setQueryData(
      [THREAD_QUERY_KEY, { threadId, isLoggedIn: false }],
      thread
    );

    const currentPost = postId
      ? thread.posts.find((post) => post.postId == postId)
      : thread.starter;
    if (!currentPost) {
      // TODO: you should log error here.
      return {};
    }
    let summary = getDeltaSummary(JSON.parse(currentPost.content));
    if (currentPost != thread.starter) {
      const starterSummary = getDeltaSummary(
        JSON.parse(thread.starter.content)
      );
      // merge the summary with the starter one
      summary = {
        ...starterSummary,
        ...summary,
      };
    }
    return {
      summary,
    };
  } catch (e) {
    error(e);
    return {};
  }
};
