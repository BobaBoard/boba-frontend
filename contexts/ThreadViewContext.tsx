import {
  GALLERY_VIEW_SUB_MODE,
  GalleryViewMode,
  GalleryViewQueryParamsType,
  GalleryViewSpecialParamsType,
  THREAD_VIEW_MODE,
  TIMELINE_VIEW_SUB_MODE,
  ThreadFilters,
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
import { useQueryParams } from "use-query-params";
import { useThreadContext } from "components/thread/ThreadContext";

// Re-export view modes for consumption of other code
export { THREAD_VIEW_MODE, GALLERY_VIEW_SUB_MODE, TIMELINE_VIEW_SUB_MODE };
export type { ThreadViewMode };

interface ThreadViewContextType {
  currentThreadViewMode: THREAD_VIEW_MODE;
  timelineViewMode: TIMELINE_VIEW_SUB_MODE;
  galleryViewMode: GalleryViewMode["galleryViewMode"];
  activeFilters: string[] | null;
  excludedNotices: string[] | null;
  setActiveFilter: (filter: string | null) => void;
  setExcludedNotices: (notices: string[] | null) => void;
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
  currentParams,
  defaultView,
  updatedViews,
}: {
  currentParams: ViewQueryParamsType;
  defaultView: THREAD_VIEW_MODE | null;
  updatedViews: ThreadViewMode;
}) => {
  const { threadViewMode, timelineViewMode, galleryViewMode } = updatedViews;
  // Thread mode has no params, only timeline & gallery mode must reckon with special ones.
  let specialViewParams:
    | GalleryViewSpecialParamsType
    | TimelineViewSpecialParamsType
    | Record<string, never> = {};
  if (threadViewMode == THREAD_VIEW_MODE.MASONRY) {
    specialViewParams = {
      // The only case when all should be specified is when it's been asked for explicitly.
      all:
        galleryViewMode.mode == GALLERY_VIEW_SUB_MODE.ALL &&
        "all" in currentParams
          ? currentParams.all
          : false,
      new: galleryViewMode.mode == GALLERY_VIEW_SUB_MODE.NEW,
      showCover: galleryViewMode.showCover,
    } as GalleryViewSpecialParamsType;
  }
  if (threadViewMode == THREAD_VIEW_MODE.TIMELINE) {
    specialViewParams = {
      // The only case when all should be specified is when it's been asked for explicitly.
      all:
        timelineViewMode == TIMELINE_VIEW_SUB_MODE.ALL && "all" in currentParams
          ? currentParams.all
          : false,
      new: timelineViewMode == TIMELINE_VIEW_SUB_MODE.NEW,
      latest: timelineViewMode == TIMELINE_VIEW_SUB_MODE.LATEST,
    } as TimelineViewSpecialParamsType;
  }

  const isDefaultView = defaultView
    ? threadViewMode == defaultView
    : threadViewMode == THREAD_VIEW_MODE.THREAD;
  return {
    // We don't add the query param to the URL when the view is default
    gallery: !isDefaultView && threadViewMode == THREAD_VIEW_MODE.MASONRY,
    timeline: !isDefaultView && threadViewMode == THREAD_VIEW_MODE.TIMELINE,
    thread: !isDefaultView && threadViewMode == THREAD_VIEW_MODE.THREAD,
    filter: currentParams.filter,
    excludedNotices: currentParams.excludedNotices,
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
  hasUpdates: boolean;
}): ThreadViewMode & ThreadFilters => {
  const filters = {
    activeFilters:
      queryParams.filter?.filter(
        (category): category is string => category !== null
      ) || null,
    excludedNotices:
      queryParams.excludedNotices?.filter(
        (notice): notice is string => notice !== null
      ) || null,
  };

  switch (nextViewMode) {
    case THREAD_VIEW_MODE.THREAD:
      return {
        threadViewMode: THREAD_VIEW_MODE.THREAD,
        galleryViewMode: null,
        timelineViewMode: null,
        ...filters,
      };
    case THREAD_VIEW_MODE.MASONRY: {
      const currentMode = isGalleryViewQueryParams(queryParams)
        ? getQueryParamsGalleryViewMode(queryParams)?.mode
        : null;
      const currentShowCover = isGalleryViewQueryParams(queryParams)
        ? getQueryParamsGalleryViewMode(queryParams)?.showCover
        : null;
      return {
        threadViewMode: THREAD_VIEW_MODE.MASONRY,
        galleryViewMode: {
          mode:
            currentMode ?? hasUpdates
              ? GALLERY_VIEW_SUB_MODE.NEW
              : GALLERY_VIEW_SUB_MODE.ALL,
          showCover: currentShowCover || isNew,
        },
        timelineViewMode: null,
        ...filters,
      };
    }
    case THREAD_VIEW_MODE.TIMELINE: {
      const currentViewMode = isTimelineViewQueryParams(queryParams)
        ? getQueryParamsTimelineViewMode(queryParams)
        : null;
      return {
        threadViewMode: THREAD_VIEW_MODE.TIMELINE,
        galleryViewMode: null,
        timelineViewMode:
          currentViewMode ?? hasUpdates
            ? TIMELINE_VIEW_SUB_MODE.NEW
            : TIMELINE_VIEW_SUB_MODE.ALL,
        ...filters,
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
}): ThreadViewMode & ThreadFilters => {
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
      updateViewQueryParams: (nextView: ThreadViewMode & ThreadFilters) => {
        setViewQueryParams(
          {
            ...getUpdatedQuery({
              currentParams: viewQueryParams as ViewQueryParamsType,
              defaultView: getThreadViewTypeFromString(defaultView),
              updatedViews: nextView,
            }),
            filter: nextView.activeFilters || undefined,
            excludedNotices: nextView.excludedNotices || undefined,
          },
          "replace"
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
  const [currentView, setCurrentView] = React.useState(
    getInitialView({
      defaultView: getThreadViewTypeFromString(defaultView),
      queryParams: viewQueryParams,
      isNew,
      hasUpdates,
    })
  );

  React.useEffect(() => {
    //Keep query params in sync when the current view changes
    // TODO: consider changing this effect to "syncExternalStore"
    updateViewQueryParams(currentView);
  }, [currentView, updateViewQueryParams]);

  const setThreadViewMode = React.useCallback(
    (viewMode: THREAD_VIEW_MODE) => {
      setCurrentView((currentView) => {
        const nextView = {
          ...currentView,
          ...getNextView({
            nextViewMode: viewMode,
            queryParams: viewQueryParams,
            isNew,
            hasUpdates,
          }),
        };
        return nextView;
      });
    },
    [viewQueryParams, hasUpdates, isNew]
  );

  const setTimelineViewMode = React.useCallback(
    (viewMode: TIMELINE_VIEW_SUB_MODE) => {
      setCurrentView((currentView) => {
        const nextView: ThreadViewMode & ThreadFilters = {
          ...currentView,
          threadViewMode: THREAD_VIEW_MODE.TIMELINE,
          timelineViewMode: viewMode,
          galleryViewMode: null,
        };

        return nextView;
      });
    },
    []
  );

  const setGalleryViewMode = React.useCallback(
    (viewMode: NonNullable<ThreadViewMode["galleryViewMode"]>) => {
      setCurrentView((currentView) => {
        if (viewMode.showCover === undefined) {
          // If the next view mode does not explicitly tell us what showCover's value is, we:
          // a) keep the existing value if we're alredady in gallery mode
          // b) check for updates to the "cover" if we're switching to gallery mode
          viewMode.showCover =
            currentView.threadViewMode == THREAD_VIEW_MODE.MASONRY
              ? currentView.galleryViewMode.showCover
              : hasRootUpdates;
        }
        const nextView: ThreadViewMode & ThreadFilters = {
          ...currentView,
          threadViewMode: THREAD_VIEW_MODE.MASONRY,
          timelineViewMode: null,
          galleryViewMode: viewMode,
        };

        return nextView;
      });
    },
    [hasRootUpdates]
  );

  const setActiveFilter = React.useCallback((filter: string | null) => {
    setCurrentView((currentView) => {
      const nextView = {
        ...currentView,
        activeFilters: filter === null ? null : [filter],
      };

      return nextView;
    });
  }, []);

  const setExcludedNotices = React.useCallback((notices: string[] | null) => {
    setCurrentView((currentView) => {
      const nextView = {
        ...currentView,
        excludedNotices: notices,
      };

      return nextView;
    });
  }, []);

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
    } else if (currentView.threadViewMode == THREAD_VIEW_MODE.THREAD) {
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
          activeFilters: currentView.activeFilters,
          excludedNotices: currentView.excludedNotices,
          setActiveFilter,
          setExcludedNotices,
          setThreadViewMode,
          setGalleryViewMode,
          setTimelineViewMode,
        }),
        [
          currentView,
          setActiveFilter,
          setExcludedNotices,
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
