import { ArrayParam, DecodedValueMap, useQueryParams } from "use-query-params";

import { ExistanceParam } from "../QueryParamNextProvider";
import { Optional } from "utility-types";
import React from "react";
import { ThreadType } from "types/Types";
import equal from "fast-deep-equal";
import { useThreadContext } from "components/thread/ThreadContext";

export enum THREAD_VIEW_MODES {
  THREAD = "THREAD",
  MASONRY = "MASONRY",
  TIMELINE = "TIMELINE",
}

export enum TIMELINE_VIEW_MODE {
  NEW = "NEW",
  LATEST = "LATEST",
  ALL = "ALL",
}

export enum GALLERY_VIEW_MODE {
  NEW = "NEW",
  ALL = "ALL",
}

export interface GalleryViewMode {
  mode: GALLERY_VIEW_MODE;
  showCover: boolean;
}

export const ThreadViewQueryParams = {
  gallery: ExistanceParam,
  timeline: ExistanceParam,
  thread: ExistanceParam,
};

const FilterParams = {
  filter: ArrayParam,
  excludedNotices: ArrayParam,
};

const TimelineViewQueryParams = {
  new: ExistanceParam,
  latest: ExistanceParam,
  all: ExistanceParam,
};

const GalleryViewQueryParams = {
  new: ExistanceParam,
  all: ExistanceParam,
  showCover: ExistanceParam,
};

// All the query params that this context keeps track of.
const VIEW_QUERY_PARAMS = {
  ...ThreadViewQueryParams,
  ...TimelineViewQueryParams,
  ...GalleryViewQueryParams,
  ...FilterParams,
};

type ViewQueryParamsType = DecodedValueMap<typeof VIEW_QUERY_PARAMS>;

interface ThreadViewContextType {
  currentThreadViewMode: THREAD_VIEW_MODES;
  timelineViewMode: TIMELINE_VIEW_MODE;
  galleryViewMode: GalleryViewMode;
  activeFilters: string[] | null;
  excludedNotices: string[] | null;
  setActiveFilter: (filter: string | null) => void;
  setExcludedNotices: (notices: string[] | null) => void;
  setThreadViewMode: (view: THREAD_VIEW_MODES) => void;
  setGalleryViewMode: (view: Optional<GalleryViewMode, "showCover">) => void;
  setTimelineViewMode: (view: TIMELINE_VIEW_MODE) => void;
}

const ThreadViewContext = React.createContext<ThreadViewContextType | null>(
  null
);

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
    default:
      throw new Error(`Found unknown view type string: ${viewString}`);
  }
};

// Returns the THREAD_VIEW_MODE set in the page params.
const getQueryParamsViewMode = (
  query: DecodedValueMap<typeof ThreadViewQueryParams>
) => {
  if (query.gallery) {
    return THREAD_VIEW_MODES.MASONRY;
  } else if (query.timeline) {
    return THREAD_VIEW_MODES.TIMELINE;
  } else if (query.thread) {
    return THREAD_VIEW_MODES.THREAD;
  }
  return null;
};

// Returns the TIMELINE_VIEW_MODE set in the page params.
const getQueryParamsTimelineViewMode = (
  timelineQuery: DecodedValueMap<typeof TimelineViewQueryParams>
) => {
  if (timelineQuery.new) {
    return TIMELINE_VIEW_MODE.NEW;
  } else if (timelineQuery.latest) {
    return TIMELINE_VIEW_MODE.LATEST;
  } else if (timelineQuery.all) {
    return TIMELINE_VIEW_MODE.ALL;
  }
  return null;
};

// Returns the GALLERY_VIEW_MODE set in the page params.
const getQueryParamsGalleryViewMode = (
  galleryQuery: DecodedValueMap<typeof GalleryViewQueryParams>
): {
  mode: GALLERY_VIEW_MODE | null;
  showCover: boolean;
} => {
  if (!galleryQuery.all && !galleryQuery.new) {
    return {
      mode: null,
      showCover: galleryQuery.showCover,
    };
  }
  return {
    mode: galleryQuery.all ? GALLERY_VIEW_MODE.ALL : GALLERY_VIEW_MODE.NEW,
    showCover: galleryQuery.showCover,
  };
};

const getUpdatedQuery = ({
  currentParams,
  defaultView,
  updatedViews,
}: {
  currentParams: ViewQueryParamsType;
  defaultView: THREAD_VIEW_MODES | null;
  updatedViews: {
    threadViewMode: THREAD_VIEW_MODES;
    timelineViewMode: TIMELINE_VIEW_MODE | null;
    galleryViewMode: GalleryViewMode | null;
  };
}) => {
  const { threadViewMode, timelineViewMode, galleryViewMode } = updatedViews;
  // Thread mode has no params, only timeline & gallery mode must reckon with special ones.
  let specialViewParams = {
    all: false,
    new: false,
    showCover: false,
    latest: false,
  };
  if (threadViewMode == THREAD_VIEW_MODES.MASONRY) {
    specialViewParams = {
      // The only case when all should be specified is when it's been asked for explicitly.
      all: !!currentParams.all,
      new:
        galleryViewMode?.mode == GALLERY_VIEW_MODE.NEW ||
        (!galleryViewMode && currentParams.new),
      showCover:
        typeof galleryViewMode?.showCover === "undefined"
          ? currentParams.showCover
          : galleryViewMode?.showCover,
      // TODO: we add this so we always have all the params available for object
      // diff when deciding whether to update params. This is a bit of a copout.
      latest: false,
    };
  }
  if (threadViewMode == THREAD_VIEW_MODES.TIMELINE) {
    specialViewParams = {
      // The only case when all should be specified is when it's been asked for explicitly.
      all: !!currentParams.all,
      new:
        timelineViewMode == TIMELINE_VIEW_MODE.NEW ||
        (!timelineViewMode && currentParams.new),
      latest:
        timelineViewMode == TIMELINE_VIEW_MODE.LATEST ||
        (!timelineViewMode && currentParams.latest),
      // TODO: we add this so we always have all the params available for object
      // diff when deciding whether to update params. This is a bit of a copout.
      showCover: false,
    };
  }

  const isDefaultView = defaultView
    ? threadViewMode == defaultView
    : threadViewMode == THREAD_VIEW_MODES.THREAD;
  return {
    gallery: !isDefaultView && threadViewMode == THREAD_VIEW_MODES.MASONRY,
    timeline: !isDefaultView && threadViewMode == THREAD_VIEW_MODES.TIMELINE,
    thread: !isDefaultView && threadViewMode == THREAD_VIEW_MODES.THREAD,
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
  nextViewMode: THREAD_VIEW_MODES;
  queryParams: ViewQueryParamsType;
  isNew: boolean;
  hasUpdates: boolean;
}) => {
  let timelineViewMode = null;
  let galleryViewMode: GalleryViewMode | null = null;
  if (nextViewMode == THREAD_VIEW_MODES.MASONRY) {
    const updatedGalleryViewMode = {
      ...getQueryParamsGalleryViewMode(queryParams),
    };
    if (updatedGalleryViewMode.mode == null) {
      updatedGalleryViewMode.mode = hasUpdates
        ? GALLERY_VIEW_MODE.NEW
        : GALLERY_VIEW_MODE.ALL;
    }
    if (!updatedGalleryViewMode.showCover) {
      updatedGalleryViewMode.showCover = isNew;
    }
    galleryViewMode = updatedGalleryViewMode as GalleryViewMode | null;
  } else if (nextViewMode == THREAD_VIEW_MODES.TIMELINE) {
    timelineViewMode = getQueryParamsTimelineViewMode(queryParams);
    if (timelineViewMode == null) {
      timelineViewMode = hasUpdates
        ? TIMELINE_VIEW_MODE.NEW
        : TIMELINE_VIEW_MODE.ALL;
    }
  }
  return {
    threadViewMode: nextViewMode,
    galleryViewMode,
    timelineViewMode,
    activeFilters:
      queryParams.filter?.filter(
        (category): category is string => category !== null
      ) || null,
    excludedNotices:
      queryParams.excludedNotices?.filter(
        (notice): notice is string => notice !== null
      ) || null,
  };
};

const getInitialView = ({
  defaultView,
  queryParams,
  isNew,
  hasUpdates,
}: {
  defaultView: THREAD_VIEW_MODES | null;
  queryParams: ViewQueryParamsType;
  isNew: boolean;
  hasUpdates: boolean;
}): {
  threadViewMode: THREAD_VIEW_MODES;
  timelineViewMode: TIMELINE_VIEW_MODE | null;
  galleryViewMode: GalleryViewMode | null;
  activeFilters: string[] | null;
  excludedNotices: string[] | null;
} => {
  const queryParamsViewMode = getQueryParamsViewMode(queryParams);
  const currentViewMode =
    queryParamsViewMode || defaultView || THREAD_VIEW_MODES.THREAD;

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
      viewQueryParams,
      updateViewQueryParams: (nextView: {
        threadViewMode: THREAD_VIEW_MODES;
        timelineViewMode: TIMELINE_VIEW_MODE | null;
        galleryViewMode: GalleryViewMode | null;
        activeFilters: string[] | null;
        excludedNotices: string[] | null;
      }) => {
        const newQueryParams = {
          ...getUpdatedQuery({
            currentParams: viewQueryParams,
            defaultView: getViewTypeFromString(defaultView),
            updatedViews: nextView,
          }),
          filter: nextView.activeFilters || undefined,
          excludedNotices: nextView.excludedNotices || undefined,
        };
        if (equal(viewQueryParams, newQueryParams)) {
          return;
        }
        setViewQueryParams(newQueryParams, "replace");
      },
    }),
    [viewQueryParams, defaultView, setViewQueryParams]
  );
};

export const ThreadViewContextProvider: React.FC = ({ children }) => {
  const { defaultView, hasNewReplies, threadRoot, isFetching } =
    useThreadContext();
  const { viewQueryParams, updateViewQueryParams } =
    useViewQueryParamsUpdater();

  const isNew = !!threadRoot?.isNew;
  const hasUpdates = !!threadRoot?.isNew || hasNewReplies;
  const [currentView, setCurrentView] = React.useState(
    getInitialView({
      defaultView: getViewTypeFromString(defaultView),
      queryParams: viewQueryParams,
      isNew,
      hasUpdates,
    })
  );

  if (typeof window !== "undefined" && !isFetching) {
    // On the client, if aren't fetching, check whether this re-render means
    // we need to update our query params.
    const nextView = getNextView({
      nextViewMode:
        getQueryParamsViewMode(viewQueryParams) ??
        getViewTypeFromString(defaultView)!,
      queryParams: viewQueryParams,
      isNew,
      hasUpdates,
    });

    if (!equal(currentView, nextView)) {
      updateViewQueryParams(nextView);
      setCurrentView(nextView);
    }
  }

  const setThreadViewMode = React.useCallback(
    (viewMode: THREAD_VIEW_MODES) => {
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
        updateViewQueryParams(nextView);
        return nextView;
      });
    },
    [setCurrentView, viewQueryParams, updateViewQueryParams, hasUpdates, isNew]
  );

  const setTimelineViewMode = React.useCallback(
    (viewMode: TIMELINE_VIEW_MODE) => {
      setCurrentView((currentView) => {
        const nextView = {
          ...currentView,
          threadViewMode: THREAD_VIEW_MODES.TIMELINE,
          timelineViewMode: viewMode,
          galleryViewMode: null,
        };
        updateViewQueryParams(nextView);

        return nextView;
      });
    },
    [setCurrentView, updateViewQueryParams]
  );

  const setGalleryViewMode = React.useCallback(
    (viewMode: GalleryViewMode) => {
      setCurrentView((currentView) => {
        if (viewMode.showCover == undefined) {
          viewMode.showCover = isNew;
        }
        const nextView = {
          ...currentView,
          threadViewMode: THREAD_VIEW_MODES.MASONRY,
          timelineViewMode: null,
          galleryViewMode: viewMode,
        };
        updateViewQueryParams(nextView);

        return nextView;
      });
    },
    [setCurrentView, updateViewQueryParams, isNew]
  );

  const setActiveFilter = React.useCallback(
    (filter: string | null) => {
      setCurrentView((currentView) => {
        const nextView = {
          ...currentView,
          activeFilters: filter === null ? null : [filter],
        };
        updateViewQueryParams(nextView);

        return nextView;
      });
    },
    [setCurrentView, updateViewQueryParams]
  );

  const setExcludedNotices = React.useCallback(
    (notices: string[] | null) => {
      setCurrentView((currentView) => {
        const nextView = {
          ...currentView,
          excludedNotices: notices,
        };
        updateViewQueryParams(nextView);

        return nextView;
      });
    },
    [setCurrentView, updateViewQueryParams]
  );

  return (
    <ThreadViewContext.Provider
      value={React.useMemo(
        () => ({
          currentThreadViewMode: currentView.threadViewMode,
          galleryViewMode: currentView.galleryViewMode || {
            mode: GALLERY_VIEW_MODE.ALL,
            showCover: false,
          },
          timelineViewMode:
            currentView.timelineViewMode || TIMELINE_VIEW_MODE.ALL,
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
// ThreadViewContextProvider.whyDidYouRender = true;

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
