import React, { SetStateAction } from "react";
import {
  FeedWithMenu,
  CycleNewButton,
  PostingActionButton,
} from "@bobaboard/ui-components";
import Layout from "components/Layout";
import LoadingSpinner from "components/LoadingSpinner";
import { useAuth } from "components/Auth";
import { THREAD_VIEW_MODES, ThreadType } from "types/Types";
import classnames from "classnames";
import { useBoardContext } from "components/BoardContext";
//import { useHotkeys } from "react-hotkeys-hook";
import ThreadView, {
  scrollToComment,
  scrollToPost,
} from "components/thread/ThreadView";
import ThreadSidebar from "components/thread/ThreadSidebar";
import GalleryThreadView from "components/thread/GalleryThreadView";
import TimelineThreadView, {
  TIMELINE_VIEW_MODE,
} from "components/thread/TimelineThreadView";
import {
  ThreadContextType,
  withThreadData,
} from "components/thread/ThreadQueryHook";
import { useRouter } from "next/router";
import { ThreadPageDetails, usePageDetails } from "../../../utils/router-utils";

import debug from "debug";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useQueryParams } from "use-query-params";
import { ExistanceParam } from "components/QueryParamNextProvider";
import { withEditors } from "components/editors/withEditors";
import {
  EditorActions,
  useEditorsDispatch,
} from "components/editors/EditorsContext";
import { useReadThread } from "components/hooks/queries/thread";
import { clearThreadData } from "utils/queries/cache";
import { useQueryClient } from "react-query";

const log = debug("bobafrontend:threadPage-log");

const getViewTypeFromString = (
  viewString: ThreadType["defaultView"] | null
) => {
  if (!viewString) {
    return null;
  }
  switch (viewString) {
    case "gallery":
      return THREAD_VIEW_MODES.MASONRY;
    case "timeline":
      return THREAD_VIEW_MODES.TIMELINE;
    case "thread":
      return THREAD_VIEW_MODES.THREAD;
  }
};

const TimelineViewQueryParams = {
  new: ExistanceParam,
  latest: ExistanceParam,
  all: ExistanceParam,
};

export const ThreadViewQueryParams = {
  gallery: ExistanceParam,
  timeline: ExistanceParam,
  thread: ExistanceParam,
};

const getQueryParamsTimelineViewMode = () => {
  const [query] = useQueryParams(TimelineViewQueryParams);
  if (query.new) {
    return TIMELINE_VIEW_MODE.NEW;
  } else if (query.latest) {
    return TIMELINE_VIEW_MODE.LATEST;
  } else if (query.all) {
    return TIMELINE_VIEW_MODE.ALL;
  }
  return TIMELINE_VIEW_MODE.NEW;
};

const getQueryParamsViewMode = (
  defaultView: ThreadType["defaultView"] | null
) => {
  const [query] = useQueryParams(ThreadViewQueryParams);

  if (query.gallery) {
    return THREAD_VIEW_MODES.MASONRY;
  } else if (query.timeline) {
    return THREAD_VIEW_MODES.TIMELINE;
  } else if (query.thread) {
    return THREAD_VIEW_MODES.THREAD;
  }
  return getViewTypeFromString(defaultView) || THREAD_VIEW_MODES.THREAD;
};

const useStateWithCallback = <T extends any>(
  initialState: T
): [T, (value: SetStateAction<T>, callback: (state: T) => void) => void] => {
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

function ThreadPage({
  threadRoot,
  newAnswersSequence,
  isLoading: isFetchingThread,
  isRefetching: isRefetchingThread,
  defaultView: threadDefaultView,
  hasNewReplies,
  chronologicalPostsSequence,
}: ThreadContextType) {
  const queryClient = useQueryClient();
  const { postId, slug, threadId } = usePageDetails<ThreadPageDetails>();
  const { isLoggedIn, isPending: isAuthPending } = useAuth();
  const { getLinkToBoard } = useCachedLinks();
  const router = useRouter();
  const { boardsData } = useBoardContext();
  const currentBoardData = boardsData?.[slug];
  const [maxDisplay, setMaxDisplay] = useStateWithCallback(2);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const closeSidebar = React.useCallback(() => setShowSidebar(false), []);
  const onCompassClick = React.useCallback(() => setShowSidebar(!showSidebar), [
    showSidebar,
  ]);
  const dispatch = useEditorsDispatch();
  const markAsRead = useReadThread();
  const hasMarkedAsRead = React.useRef(false);

  React.useEffect(() => {
    if (
      !isAuthPending &&
      !isFetchingThread &&
      !isRefetchingThread &&
      isLoggedIn &&
      !hasMarkedAsRead.current
    ) {
      markAsRead({ slug, threadId });
      hasMarkedAsRead.current = true;
      return;
    }
  }, [isAuthPending, isFetchingThread, isRefetchingThread, isLoggedIn]);

  React.useEffect(() => {
    return () => {
      if (!threadId || !slug) {
        return;
      }
      clearThreadData(queryClient, { slug, threadId });
      hasMarkedAsRead.current = false;
    };
  }, []);

  // URL params management
  const queryParamsViewMode = getQueryParamsViewMode(threadDefaultView);
  const [threadViewQuery, setQuery] = useQueryParams({
    ...ThreadViewQueryParams,
    ...TimelineViewQueryParams,
  });
  const queryParamsTimelineViewMode = getQueryParamsTimelineViewMode();

  const onThreadViewModeChange = React.useCallback(
    (viewMode: THREAD_VIEW_MODES) => {
      const isDefaultView =
        getViewTypeFromString(threadDefaultView) === viewMode;
      const isTimeline = isDefaultView
        ? getViewTypeFromString(threadDefaultView) ===
          THREAD_VIEW_MODES.TIMELINE
        : viewMode === THREAD_VIEW_MODES.TIMELINE;
      setQuery({
        gallery: !isDefaultView && viewMode == THREAD_VIEW_MODES.MASONRY,
        timeline: viewMode == THREAD_VIEW_MODES.TIMELINE,
        thread: !isDefaultView && viewMode == THREAD_VIEW_MODES.THREAD,
        all:
          isTimeline && queryParamsTimelineViewMode == TIMELINE_VIEW_MODE.ALL,
        new:
          isTimeline && hasNewReplies
            ? queryParamsTimelineViewMode == TIMELINE_VIEW_MODE.NEW
            : false,
        latest:
          isTimeline &&
          (queryParamsTimelineViewMode == TIMELINE_VIEW_MODE.LATEST ||
            (!hasNewReplies &&
              queryParamsTimelineViewMode == TIMELINE_VIEW_MODE.NEW)),
      });
    },
    [threadDefaultView]
  );

  const onTimelineViewModeChange = React.useCallback(
    (viewMode) => {
      setQuery(
        {
          thread: false,
          gallery: false,
          timeline: true,
          all: viewMode == TIMELINE_VIEW_MODE.ALL,
          new: viewMode == TIMELINE_VIEW_MODE.NEW,
          latest: viewMode == TIMELINE_VIEW_MODE.LATEST,
        },
        "replaceIn"
      );
    },
    [threadDefaultView]
  );

  React.useEffect(() => {
    const hasDefinedViewType = Object.values(threadViewQuery).some(
      (value) => value
    );
    if (!isFetchingThread && !hasDefinedViewType) {
      const defaultViewType =
        getViewTypeFromString(threadDefaultView) || THREAD_VIEW_MODES.THREAD;
      onThreadViewModeChange(defaultViewType);
    }
  }, [isFetchingThread]);
  const newAnswersIndex = React.useRef<number>(-1);

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

  const onNewContribution = React.useCallback(
    (replyToContributionId: string) => {
      dispatch({
        type: EditorActions.NEW_CONTRIBUTION,
        payload: {
          boardSlug: slug,
          threadId,
          replyToContributionId,
        },
      });
    },
    [slug, threadId]
  );

  const onNewAnswersButtonClick = () => {
    if (!newAnswersSequence) {
      return;
    }
    log(newAnswersSequence);
    log(newAnswersIndex);
    // @ts-ignore
    newAnswersIndex.current =
      (newAnswersIndex.current + 1) % newAnswersSequence.length;
    const nextPost = newAnswersSequence[newAnswersIndex.current].postId;
    const nextComment = newAnswersSequence[newAnswersIndex.current].commentId;
    if (nextPost) {
      scrollToPost(nextPost, currentBoardData?.accentColor || "#f96680");
    }
    if (nextComment) {
      scrollToComment(nextComment, currentBoardData?.accentColor || "#f96680");
    }
  };

  const canTopLevelPost =
    isLoggedIn &&
    (queryParamsViewMode == THREAD_VIEW_MODES.MASONRY ||
      queryParamsViewMode == THREAD_VIEW_MODES.TIMELINE);
  const maxVisible =
    queryParamsViewMode == THREAD_VIEW_MODES.TIMELINE &&
    queryParamsTimelineViewMode == TIMELINE_VIEW_MODE.NEW
      ? newAnswersSequence.length
      : chronologicalPostsSequence.length;
  return (
    <div className="main">
      <Layout
        title={`!${slug}`}
        loading={isFetchingThread}
        onCompassClick={onCompassClick}
      >
        <Layout.MainContent>
          <FeedWithMenu
            forceHideSidebar={router.query.hideSidebar !== undefined}
            showSidebar={showSidebar}
            onCloseSidebar={closeSidebar}
            reachToBottom={maxDisplay < maxVisible}
            onReachEnd={React.useCallback((more) => {
              setMaxDisplay(
                (maxDisplay) => maxDisplay + 4,
                (maxDisplay) => {
                  more(maxDisplay < maxVisible);
                }
              );
            }, [])}
          >
            <FeedWithMenu.Sidebar>
              <MemoizedThreadSidebar
                viewMode={queryParamsViewMode}
                open={showSidebar}
                onViewChange={onThreadViewModeChange}
              />
            </FeedWithMenu.Sidebar>
            <FeedWithMenu.FeedContent>
              <div
                className={classnames("feed", {
                  loading: isFetchingThread || isRefetchingThread,
                })}
              >
                <div className="view-modes">
                  {queryParamsViewMode == THREAD_VIEW_MODES.THREAD || postId ? (
                    <MemoizedThreadView />
                  ) : queryParamsViewMode == THREAD_VIEW_MODES.MASONRY ? (
                    <MemoizedGalleryThreadView displayAtMost={maxDisplay} />
                  ) : (
                    <MemoizedTimelineThreadView
                      displayAtMost={maxDisplay}
                      viewMode={queryParamsTimelineViewMode}
                      onViewModeChange={onTimelineViewModeChange}
                    />
                  )}
                </div>
              </div>
              <LoadingSpinner
                loading={isFetchingThread || isRefetchingThread}
                idleMessage={
                  // Check whether there's more posts to display
                  (
                    queryParamsViewMode == THREAD_VIEW_MODES.TIMELINE &&
                    queryParamsTimelineViewMode == TIMELINE_VIEW_MODE.NEW
                      ? maxDisplay <= newAnswersSequence.length
                      : maxDisplay <= chronologicalPostsSequence.length
                  )
                    ? "..."
                    : queryParamsViewMode == THREAD_VIEW_MODES.THREAD
                    ? ""
                    : "Nothing more to load."
                }
                loadingMessage="Loading"
              />
            </FeedWithMenu.FeedContent>
          </FeedWithMenu>
        </Layout.MainContent>
        <Layout.ActionButton>
          {queryParamsViewMode == THREAD_VIEW_MODES.THREAD &&
          !!newAnswersSequence.length ? (
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
          }
          .feed.loading .view-modes {
            display: none;
          }
        `}
      </style>
    </div>
  );
}

export default withThreadData(withEditors(ThreadPage), {
  fetch: true,
});
