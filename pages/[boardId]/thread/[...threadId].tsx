import React from "react";
import {
  FeedWithMenu,
  CycleNewButton,
  PostingActionButton,
} from "@bobaboard/ui-components";
import Layout from "components/Layout";
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
import { useEditors } from "components/editors/useEditors";
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

const ThreadViewQueryParams = {
  gallery: ExistanceParam,
  timeline: ExistanceParam,
  thread: ExistanceParam,
};

const getCurrentTimelineViewMode = () => {
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

const getCurrentViewMode = (defaultView: ThreadType["defaultView"] | null) => {
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

const MemoizedThreadSidebar = React.memo(ThreadSidebar);
const MemoizedThreadView = React.memo(ThreadView);
const MemoizedGalleryThreadView = React.memo(GalleryThreadView);
const MemoizedTimelineThreadView = React.memo(TimelineThreadView);

function ThreadPage({
  threadRoot,
  newAnswersSequence,
  isLoading: isFetchingThread,
  isRefetching: isRefetchingThread,
  defaultView,
}: ThreadContextType) {
  const { postId, slug } = usePageDetails<ThreadPageDetails>();
  const {
    Editors,
    editorsProps,
    setPostReplyId,
    setPostEdit,
    setCommentReplyId,
  } = useEditors();
  const { isLoggedIn, isPending: isAuthPending } = useAuth();
  const { getLinkToBoard } = useCachedLinks();
  const router = useRouter();
  const { boardsData } = useBoardContext();
  const currentBoardData = boardsData?.[slug];
  const [maxDisplay, setMaxDisplay] = React.useState(2);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const closeSidebar = React.useCallback(() => setShowSidebar(false), []);
  const onCompassClick = React.useCallback(() => setShowSidebar(!showSidebar), [
    showSidebar,
  ]);

  // URL params management
  const currentViewMode = getCurrentViewMode(defaultView);
  const [viewMode, setViewMode] = React.useState(currentViewMode);
  const [threadViewQuery, setQuery] = useQueryParams({
    ...ThreadViewQueryParams,
    ...TimelineViewQueryParams,
  });
  const currentTimelineViewMode = getCurrentTimelineViewMode();
  const [timelineView, setTimelineView] = React.useState(
    TIMELINE_VIEW_MODE.NEW
  );

  const onThreadViewModeChange = React.useCallback(
    (viewMode: THREAD_VIEW_MODES) => {
      const isDefaultView = getViewTypeFromString(defaultView) === viewMode;
      const isTimeline = isDefaultView
        ? getViewTypeFromString(defaultView) === THREAD_VIEW_MODES.TIMELINE
        : viewMode === THREAD_VIEW_MODES.TIMELINE;
      const hasNewPosts = newAnswersSequence.length > 0;
      setQuery({
        gallery: !isDefaultView && viewMode == THREAD_VIEW_MODES.MASONRY,
        timeline: viewMode == THREAD_VIEW_MODES.TIMELINE,
        thread: !isDefaultView && viewMode == THREAD_VIEW_MODES.THREAD,
        all: isTimeline && currentTimelineViewMode == TIMELINE_VIEW_MODE.ALL,
        new:
          isTimeline && hasNewPosts
            ? currentTimelineViewMode == TIMELINE_VIEW_MODE.NEW
            : false,
        latest:
          isTimeline &&
          (currentTimelineViewMode == TIMELINE_VIEW_MODE.LATEST ||
            (!hasNewPosts &&
              currentTimelineViewMode == TIMELINE_VIEW_MODE.NEW)),
      });
    },
    [defaultView]
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
    [defaultView]
  );

  React.useEffect(() => {
    setViewMode(currentViewMode);
    setTimelineView(currentTimelineViewMode);
  }, [threadViewQuery]);

  React.useEffect(() => {
    const hasDefinedViewType = Object.values(threadViewQuery).some(
      (value) => value
    );
    if (!isFetchingThread && !hasDefinedViewType) {
      const defaultViewType =
        getViewTypeFromString(defaultView) || THREAD_VIEW_MODES.THREAD;
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

  const replyToComment = React.useCallback(
    (replyToPostId, replyToCommentId) =>
      setCommentReplyId({
        postId: replyToPostId,
        commentId: replyToCommentId,
      }),
    [setCommentReplyId]
  );

  const canTopLevelPost =
    isLoggedIn &&
    (viewMode == THREAD_VIEW_MODES.MASONRY ||
      viewMode == THREAD_VIEW_MODES.TIMELINE);

  return (
    <div className="main">
      <Editors {...editorsProps} />
      <Layout
        mainContent={
          <FeedWithMenu
            forceHideSidebar={router.query.hideSidebar !== undefined}
            showSidebar={showSidebar}
            onCloseSidebar={closeSidebar}
            sidebarContent={
              <MemoizedThreadSidebar
                viewMode={viewMode}
                open={showSidebar}
                onViewChange={onThreadViewModeChange}
              />
            }
            feedContent={
              <div
                className={classnames("feed", {
                  thread: viewMode == THREAD_VIEW_MODES.THREAD || postId,
                  masonry: viewMode == THREAD_VIEW_MODES.MASONRY && !postId,
                  timeline: viewMode == THREAD_VIEW_MODES.TIMELINE && !postId,
                  loading: isFetchingThread,
                })}
              >
                <div className="view-modes">
                  {viewMode == THREAD_VIEW_MODES.THREAD || postId ? (
                    <MemoizedThreadView
                      onNewComment={replyToComment}
                      onNewContribution={setPostReplyId}
                      onEditPost={setPostEdit}
                      isLoggedIn={isLoggedIn}
                    />
                  ) : viewMode == THREAD_VIEW_MODES.MASONRY ? (
                    <MemoizedGalleryThreadView
                      onNewComment={replyToComment}
                      onNewContribution={setPostReplyId}
                      isLoggedIn={isLoggedIn}
                      onEditPost={setPostEdit}
                      displayAtMost={maxDisplay}
                    />
                  ) : (
                    <MemoizedTimelineThreadView
                      onNewComment={replyToComment}
                      onNewContribution={setPostReplyId}
                      isLoggedIn={isLoggedIn}
                      onEditPost={setPostEdit}
                      displayAtMost={maxDisplay}
                      viewMode={timelineView}
                      onViewModeChange={onTimelineViewModeChange}
                    />
                  )}
                </div>
                <div
                  className={classnames("loading-indicator", {
                    loading: isFetchingThread || isRefetchingThread,
                  })}
                >
                  Loading...
                </div>
                <div className="bobadab-container">
                  <div
                    className={classnames("bobadab", {
                      refetching: isRefetchingThread,
                    })}
                    onClick={() => {
                      window.scroll({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                  />
                </div>
              </div>
            }
            onReachEnd={React.useCallback(() => {
              setMaxDisplay((maxDisplay) => maxDisplay + 2);
            }, [])}
          />
        }
        title={`!${slug}`}
        loading={isFetchingThread}
        onCompassClick={onCompassClick}
        actionButton={
          viewMode == THREAD_VIEW_MODES.THREAD &&
          !!newAnswersSequence.length ? (
            <CycleNewButton text="Next New" onNext={onNewAnswersButtonClick} />
          ) : canTopLevelPost ? (
            <PostingActionButton
              accentColor={currentBoardData?.accentColor || "#f96680"}
              onNewPost={() => threadRoot && setPostReplyId(threadRoot.postId)}
            />
          ) : undefined
        }
      />
      <style jsx>
        {`
          .feed {
            max-width: 100%;
            padding-bottom: 70px;
            position: relative;
          }
          .feed.loading .view-modes {
            display: none;
          }
          .feed.timeline {
            width: 100%;
          }
          .feed.masonry {
            width: 100%;
            position: relative;
            margin-top: 20px;
          }
          .loading-indicator {
            color: white;
            text-align: center;
            padding: 20px;
            display: none;
          }
          .loading-indicator.loading {
            display: block;
          }
          .bobadab-container {
            position: absolute;
            width: 70px;
            height: 70px;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
          }
          .bobadab {
            display: none;
            background-image: url("/bobadab.png");
            background-size: contain;
            width: 50px;
            height: 50px;
            position: absolute;
            bottom: 0;
            left: 10px;
          }
          .bobadab.refetching {
            animation: rotation 2s infinite linear;
          }
          @keyframes rotation {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(359deg);
            }
          }
          .bobadab:hover {
            cursor: pointer;
          }
          .feed:not(.loading) .bobadab {
            display: block;
          }
        `}
      </style>
    </div>
  );
}

export default withThreadData(ThreadPage, {
  markReadOnMount: true,
  fetch: true,
});
