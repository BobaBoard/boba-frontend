import {
  GALLERY_VIEW_SUB_MODE,
  GalleryViewMode,
  GalleryViewQueryParamsType,
  GalleryViewSpecialParamsType,
  THREAD_VIEW_MODE,
  TIMELINE_VIEW_SUB_MODE,
  ThreadViewMode,
  TimelineViewQueryParamsType,
  TimelineViewSpecialParamsType,
  VIEW_QUERY_PARAMS,
  ViewQueryParamsType,
  getThreadViewTypeFromString,
  isGalleryViewQueryParams,
  isTimelineViewQueryParams,
} from "types/ThreadQueryParams";

import { Optional } from "utility-types";
import React from "react";
import debug from "debug";
import { useQueryParams } from "use-query-params";
import { useThreadContext } from "components/thread/ThreadContext";

const log = debug("bobafrontend:contexts:ThreadViewContext-log");
// log.enabled = true;

// Re-export view modes for consumption of other code
export { THREAD_VIEW_MODE, GALLERY_VIEW_SUB_MODE, TIMELINE_VIEW_SUB_MODE };
export type { ThreadViewMode };

interface ThreadViewContextType {
  currentThreadViewMode: THREAD_VIEW_MODE;
  timelineViewMode: TIMELINE_VIEW_SUB_MODE;
  galleryViewMode: GalleryViewMode["galleryViewMode"];
  setThreadViewMode: (view: THREAD_VIEW_MODE) => void;
  setGalleryViewMode: (
    view: Optional<GalleryViewMode["galleryViewMode"], "showCover">
  ) => void;
  setTimelineViewMode: (view: TIMELINE_VIEW_SUB_MODE) => void;
}

const ThreadViewContext = React.createContext<ThreadViewContextType | null>(
  null
);

// Returns the THREAD_VIEW_MODE set in the page params.
const getQueryParamsViewMode = (query: ViewQueryParamsType) => {
  if (query.gallery) {
    return THREAD_VIEW_MODE.MASONRY;
  } else if (query.timeline) {
    return THREAD_VIEW_MODE.TIMELINE;
  } else if (query.thread) {
    return THREAD_VIEW_MODE.THREAD;
  }
  return null;
};

// Returns the TIMELINE_VIEW_SUB_MODE set in the page params.
const getQueryParamsTimelineViewMode = (
  timelineQuery: TimelineViewQueryParamsType
): ThreadViewMode["timelineViewMode"] => {
  if (timelineQuery.new) {
    return TIMELINE_VIEW_SUB_MODE.NEW;
  } else if (timelineQuery.latest) {
    return TIMELINE_VIEW_SUB_MODE.LATEST;
  } else if (timelineQuery.all) {
    return TIMELINE_VIEW_SUB_MODE.ALL;
  }
  return null;
};

// Returns the GALLERY_VIEW_SUB_MODE set in the page params.
const getQueryParamsGalleryViewMode = (
  galleryQuery: GalleryViewQueryParamsType
): Partial<ThreadViewMode["galleryViewMode"]> => {
  if (!galleryQuery.all && !galleryQuery.new) {
    return {
      showCover: galleryQuery.showCover,
    };
  }
  return {
    mode: galleryQuery.all
      ? GALLERY_VIEW_SUB_MODE.ALL
      : GALLERY_VIEW_SUB_MODE.NEW,
    showCover: galleryQuery.showCover,
  };
};

/**
 * Returns the query corresponding to the "updatedViews" params.
 * This method not make choices about the next view, but simply reflect how
 * the query params should look given the updatedView in the params.
 */
const getUpdatedQuery = ({
  defaultView,
  updatedViews,
}: {
  defaultView: THREAD_VIEW_MODE | null;
  updatedViews: ThreadViewMode;
}) => {
  const { threadViewMode, timelineViewMode, galleryViewMode } = updatedViews;
  log("in update query params: timelineViewMode", timelineViewMode);
  log("in update query params: galleryViewMode %o", galleryViewMode);
  // Thread mode has no params, only timeline & gallery mode must reckon with special ones.
  let specialViewParams:
    | GalleryViewSpecialParamsType
    | TimelineViewSpecialParamsType = {
    // Clear previous special params
    all: false,
    new: false,
    latest: false,
    showCover: false,
  };
  if (threadViewMode == THREAD_VIEW_MODE.MASONRY) {
    specialViewParams = {
      ...specialViewParams,
      all: galleryViewMode.mode == GALLERY_VIEW_SUB_MODE.ALL,
      new: galleryViewMode.mode == GALLERY_VIEW_SUB_MODE.NEW,
      showCover: galleryViewMode.showCover,
    };
  }
  if (threadViewMode == THREAD_VIEW_MODE.TIMELINE) {
    specialViewParams = {
      ...specialViewParams,
      all: timelineViewMode == TIMELINE_VIEW_SUB_MODE.ALL,
      new: timelineViewMode == TIMELINE_VIEW_SUB_MODE.NEW,
      latest: timelineViewMode == TIMELINE_VIEW_SUB_MODE.LATEST,
    };
  }

  const isDefaultView = defaultView
    ? threadViewMode == defaultView
    : threadViewMode == THREAD_VIEW_MODE.THREAD;
  return {
    // We don't add the query param to the URL when the view is default
    gallery: !isDefaultView && threadViewMode == THREAD_VIEW_MODE.MASONRY,
    timeline: !isDefaultView && threadViewMode == THREAD_VIEW_MODE.TIMELINE,
    thread: !isDefaultView && threadViewMode == THREAD_VIEW_MODE.THREAD,
    ...specialViewParams,
  };
};

const getNextView = ({
  nextViewMode,
  queryParams,
  isNew,
  hasUpdates,
}: {
  nextViewMode: THREAD_VIEW_MODE;
  queryParams: ViewQueryParamsType;
  isNew: boolean;
  hasUpdates?: boolean;
}): ThreadViewMode => {
  switch (nextViewMode) {
    case THREAD_VIEW_MODE.THREAD:
      return {
        threadViewMode: THREAD_VIEW_MODE.THREAD,
        galleryViewMode: null,
        timelineViewMode: null,
      };
    case THREAD_VIEW_MODE.MASONRY: {
      const currentMode = isGalleryViewQueryParams(queryParams)
        ? getQueryParamsGalleryViewMode(queryParams)?.mode
        : null;
      log("next view, masonry currentMode", currentMode);

      const currentShowCover = isGalleryViewQueryParams(queryParams)
        ? getQueryParamsGalleryViewMode(queryParams)?.showCover
        : null;
      log("next view, masonry currentShowCover", currentShowCover);

      return {
        threadViewMode: THREAD_VIEW_MODE.MASONRY,
        galleryViewMode: {
          mode:
            // We only go to "new" mode if explicitly requested or we're already in it, or no mode is specified and there are new updates
            currentMode
              ? currentMode
              : hasUpdates || ("new" in queryParams && queryParams.new)
              ? GALLERY_VIEW_SUB_MODE.NEW
              : GALLERY_VIEW_SUB_MODE.ALL,
          showCover: currentShowCover || isNew,
        },
        timelineViewMode: null,
      };
    }
    case THREAD_VIEW_MODE.TIMELINE: {
      const currentViewMode = isTimelineViewQueryParams(queryParams)
        ? getQueryParamsTimelineViewMode(queryParams)
        : null;
      log("next view, timeline currentViewMode", currentViewMode);
      return {
        threadViewMode: THREAD_VIEW_MODE.TIMELINE,
        galleryViewMode: null,
        timelineViewMode:
          // We only go to "new" mode if explicitly requested or we're already in it, or no mode is specified and there are new updates
          currentViewMode
            ? currentViewMode
            : hasUpdates || ("new" in queryParams && queryParams.new)
            ? TIMELINE_VIEW_SUB_MODE.NEW
            : TIMELINE_VIEW_SUB_MODE.ALL,
      };
    }
  }
};

const getInitialView = ({
  defaultView,
  queryParams,
  isNew,
  hasUpdates,
}: {
  defaultView: THREAD_VIEW_MODE | null;
  queryParams: ViewQueryParamsType;
  isNew: boolean;
  hasUpdates: boolean;
}): ThreadViewMode => {
  const queryParamsViewMode = getQueryParamsViewMode(queryParams);
  const currentViewMode =
    queryParamsViewMode || defaultView || THREAD_VIEW_MODE.THREAD;

  return getNextView({
    nextViewMode: currentViewMode,
    queryParams,
    isNew,
    hasUpdates,
  });
};

const useViewQueryParamsUpdater = () => {
  const { defaultView } = useThreadContext();
  const [viewQueryParams, setViewQueryParams] =
    useQueryParams(VIEW_QUERY_PARAMS);

  return React.useMemo(
    () => ({
      viewQueryParams: viewQueryParams as ViewQueryParamsType,
      updateViewQueryParams: (nextView: ThreadViewMode) => {
        setViewQueryParams(
          {
            ...getUpdatedQuery({
              defaultView: getThreadViewTypeFromString(defaultView),
              updatedViews: nextView,
            }),
          },
          "pushIn"
        );
      },
    }),
    [viewQueryParams, defaultView, setViewQueryParams]
  );
};

export const ThreadViewContextProvider: React.FC = ({ children }) => {
  const {
    defaultView,
    hasNewReplies,
    threadRoot,
    postCommentsMap,
    isFetching,
  } = useThreadContext();
  const { viewQueryParams, updateViewQueryParams } =
    useViewQueryParamsUpdater();

  const isNew = !!threadRoot?.isNew;
  const hasRootUpdates = threadRoot
    ? threadRoot.isNew || !!postCommentsMap.get(threadRoot.postId)?.new
    : false;
  const hasUpdates = !!threadRoot?.isNew || hasNewReplies;
  const currentView = getInitialView({
    defaultView: getThreadViewTypeFromString(defaultView),
    queryParams: viewQueryParams,
    isNew,
    hasUpdates,
  });
  log("view mode", currentView.threadViewMode);
  log("gallery mode", currentView.galleryViewMode?.mode);
  log("show cover", currentView.galleryViewMode?.showCover);
  log("timeline mode", currentView.timelineViewMode);

  const setThreadViewMode = React.useCallback(
    (viewMode: THREAD_VIEW_MODE) => {
      const nextView = getNextView({
        nextViewMode: viewMode,
        queryParams: viewQueryParams,
        isNew,
      });
      updateViewQueryParams(nextView);
    },
    [viewQueryParams, isNew, updateViewQueryParams]
  );

  const setTimelineViewMode = React.useCallback(
    (viewMode: TIMELINE_VIEW_SUB_MODE) => {
      const nextView: ThreadViewMode = {
        ...currentView,
        threadViewMode: THREAD_VIEW_MODE.TIMELINE,
        timelineViewMode: viewMode,
        galleryViewMode: null,
      };
      updateViewQueryParams(nextView);
    },
    [currentView, updateViewQueryParams]
  );

  const setGalleryViewMode: ThreadViewContextType["setGalleryViewMode"] =
    React.useCallback(
      (viewMode) => {
        const nextViewMode = {
          ...viewMode,
          showCover:
            viewMode.showCover ??
            // If the next view mode does not explicitly tell us what showCover's value is, we:
            // a) keep the existing value if we're already in gallery mode
            // b) check for updates to the "cover" if we're switching to gallery mode
            currentView.threadViewMode == THREAD_VIEW_MODE.MASONRY
              ? // TODO: figure out why galleryViewMode may be null here (or is it only in tests?)
                currentView.galleryViewMode?.showCover ?? true
              : hasRootUpdates,
        };
        const nextView: ThreadViewMode = {
          ...currentView,
          threadViewMode: THREAD_VIEW_MODE.MASONRY,
          timelineViewMode: null,
          galleryViewMode: nextViewMode,
        };

        updateViewQueryParams(nextView);
      },
      [hasRootUpdates, currentView, updateViewQueryParams]
    );

  const hasLoaded = React.useRef(false);
  React.useEffect(() => {
    if (isFetching || hasLoaded.current) {
      return;
    }
    // After first load, we switch to new if there's new replies.
    hasLoaded.current = true;
    if (!hasNewReplies) {
      return;
    }
    if (currentView.threadViewMode == THREAD_VIEW_MODE.MASONRY) {
      setGalleryViewMode({
        mode: GALLERY_VIEW_SUB_MODE.NEW,
        showCover: hasRootUpdates,
      });
    } else if (currentView.threadViewMode == THREAD_VIEW_MODE.TIMELINE) {
      setTimelineViewMode(TIMELINE_VIEW_SUB_MODE.NEW);
    }
  }, [
    isFetching,
    hasNewReplies,
    setGalleryViewMode,
    setTimelineViewMode,
    currentView.threadViewMode,
    hasRootUpdates,
  ]);

  return (
    <ThreadViewContext.Provider
      value={React.useMemo(
        () => ({
          currentThreadViewMode: currentView.threadViewMode,
          galleryViewMode: currentView.galleryViewMode || {
            mode: GALLERY_VIEW_SUB_MODE.ALL,
            showCover: false,
          },
          timelineViewMode:
            currentView.timelineViewMode || TIMELINE_VIEW_SUB_MODE.ALL,
          setThreadViewMode,
          setGalleryViewMode,
          setTimelineViewMode,
        }),
        [
          currentView,
          setThreadViewMode,
          setGalleryViewMode,
          setTimelineViewMode,
        ]
      )}
    >
      {children}
    </ThreadViewContext.Provider>
  );
};
ThreadViewContextProvider.whyDidYouRender = true;

export const useThreadViewContext = () => {
  const context = React.useContext<ThreadViewContextType | null>(
    ThreadViewContext
  );

  if (!context) {
    throw new Error(
      "ThreadViewContext should be used within a context provider."
    );
  }

  return context;
};
