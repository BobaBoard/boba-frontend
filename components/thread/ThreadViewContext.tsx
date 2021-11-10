import { ArrayParam, DecodedValueMap, useQueryParams } from "use-query-params";

import { ExistanceParam } from "../QueryParamNextProvider";
import React from "react";
import { ThreadType } from "types/Types";
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

const DEFAULT_GALLERY_VIEW_MODE: GalleryViewMode = {
  mode: GALLERY_VIEW_MODE.ALL,
  showCover: false,
};

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

export const GalleryViewQueryParams = {
  new: ExistanceParam,
  all: ExistanceParam,
  showCover: ExistanceParam,
};

interface ThreadViewContextType {
  currentThreadViewMode: THREAD_VIEW_MODES;
  timelineViewMode: TIMELINE_VIEW_MODE;
  galleryViewMode: GalleryViewMode;
  activeFilters: string[] | null;
  excludedNotices: string[] | null;
  setActiveFilter: (filter: string | null) => void;
  setExcludedNotices: (notices: string[] | null) => void;
  setThreadViewMode: (view: THREAD_VIEW_MODES) => void;
  setGalleryViewMode: (view: GalleryViewMode) => void;
  setTimelineViewMode: (view: TIMELINE_VIEW_MODE) => void;
  addOnChangeHandler: (callback: (mode: THREAD_VIEW_MODES) => void) => void;
  removeOnChangeHandler: (callback: (mode: THREAD_VIEW_MODES) => void) => void;
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
const getTimelineViewMode = (
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

const getGalleryViewMode = (
  galleryQuery: DecodedValueMap<typeof GalleryViewQueryParams>
) => {
  if (!galleryQuery.all && !galleryQuery.new) {
    return {
      mode: DEFAULT_GALLERY_VIEW_MODE.mode,
      showCover: galleryQuery.showCover,
    };
  }
  return {
    mode: galleryQuery.all ? GALLERY_VIEW_MODE.ALL : GALLERY_VIEW_MODE.NEW,
    showCover: galleryQuery.showCover,
  };
};

const getUpdatedQuery = (
  currentParams: any,
  defaultView: THREAD_VIEW_MODES | null,
  updatedViews: {
    threadViewMode: THREAD_VIEW_MODES;
    timelineViewMode: TIMELINE_VIEW_MODE | null;
    galleryViewMode: GalleryViewMode | null;
  }
) => {
  const { threadViewMode, timelineViewMode, galleryViewMode } = updatedViews;
  // Thread mode has no params, only timeline & gallery mode must reckon with special ones.
  let specialViewParams = {};
  if (threadViewMode == THREAD_VIEW_MODES.MASONRY) {
    const hasGalleryParams = currentParams.all || currentParams.new;
    specialViewParams = {
      all: galleryViewMode
        ? galleryViewMode?.mode == GALLERY_VIEW_MODE.ALL
        : currentParams.all || !hasGalleryParams,
      new:
        galleryViewMode?.mode == GALLERY_VIEW_MODE.NEW ||
        (!galleryViewMode && currentParams.new),
      showCover:
        typeof galleryViewMode?.showCover === "undefined"
          ? currentParams.showCover
          : galleryViewMode?.showCover,
    };
  }
  if (threadViewMode == THREAD_VIEW_MODES.TIMELINE) {
    const hasTimelineParams =
      currentParams.all || currentParams.new || currentParams.latest;
    specialViewParams = {
      // Either we were asked for "all", or we haven't been asked for a specific view,
      // and are relying on params instead. Or it's the default.
      all: timelineViewMode
        ? timelineViewMode == TIMELINE_VIEW_MODE.ALL
        : currentParams.all || !hasTimelineParams,
      new:
        timelineViewMode == TIMELINE_VIEW_MODE.NEW ||
        (!timelineViewMode && currentParams.new),
      latest:
        timelineViewMode == TIMELINE_VIEW_MODE.LATEST ||
        (!timelineViewMode && currentParams.latest),
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

let THREAD_VIEW_CHANGE_HANDLERS: ((mode: THREAD_VIEW_MODES) => void)[] = [];
export const ThreadViewContextProvider: React.FC = ({ children }) => {
  const [threadViewQuery, setThreadViewQuery] = useQueryParams({
    ...ThreadViewQueryParams,
    ...TimelineViewQueryParams,
    ...GalleryViewQueryParams,
    ...FilterParams,
  });
  const {
    isLoading,
    isRefetching,
    defaultView,
    hasNewReplies,
    threadRoot,
    postCommentsMap,
    chronologicalPostsSequence,
  } = useThreadContext();
  const setThreadViewMode = React.useCallback(
    (viewMode: THREAD_VIEW_MODES) => {
      const isDefaultView = getViewTypeFromString(defaultView) === viewMode;
      setThreadViewQuery({
        gallery: !isDefaultView && viewMode == THREAD_VIEW_MODES.MASONRY,
        timeline: !isDefaultView && viewMode == THREAD_VIEW_MODES.TIMELINE,
        thread: !isDefaultView && viewMode == THREAD_VIEW_MODES.THREAD,
      });
      THREAD_VIEW_CHANGE_HANDLERS.forEach((callback) => callback(viewMode));
    },
    [defaultView, setThreadViewQuery]
  );

  const setTimelineViewMode = React.useCallback(
    (viewMode: TIMELINE_VIEW_MODE) => {
      setThreadViewQuery(
        getUpdatedQuery(threadViewQuery, getViewTypeFromString(defaultView), {
          threadViewMode: THREAD_VIEW_MODES.TIMELINE,
          timelineViewMode: viewMode,
          galleryViewMode: null,
        }),
        "replace"
      );
    },
    [setThreadViewQuery, threadViewQuery, defaultView]
  );

  const setGalleryViewMode = React.useCallback(
    (viewMode: GalleryViewMode) => {
      setThreadViewQuery(
        {
          ...getUpdatedQuery(
            threadViewQuery,
            getViewTypeFromString(defaultView),
            {
              threadViewMode: THREAD_VIEW_MODES.MASONRY,
              timelineViewMode: null,
              galleryViewMode: viewMode,
            }
          ),
        },
        "replace"
      );
    },
    [setThreadViewQuery, threadViewQuery, defaultView]
  );

  const isFetching = isRefetching || isLoading;
  const queryParamsViewMode = getQueryParamsViewMode(threadViewQuery);
  const currentThreadViewMode =
    queryParamsViewMode ||
    getViewTypeFromString(defaultView) ||
    THREAD_VIEW_MODES.THREAD;
  const currentTimelineViewMode =
    getTimelineViewMode(threadViewQuery) || TIMELINE_VIEW_MODE.ALL;
  const currentGalleryViewMode = getGalleryViewMode(threadViewQuery);

  // TODO: this function likely needs to be called only once per thread.
  // TODO: can we change view while the thread is open?
  React.useEffect(() => {
    if (isFetching) {
      return;
    }

    const timelineViewMode = hasNewReplies
      ? TIMELINE_VIEW_MODE.NEW
      : TIMELINE_VIEW_MODE.ALL;
    const galleryViewMode = {
      mode: hasNewReplies ? GALLERY_VIEW_MODE.NEW : GALLERY_VIEW_MODE.ALL,
      showCover:
        threadRoot?.isNew ||
        (!!threadRoot?.postId &&
          !!postCommentsMap.get(threadRoot.postId)?.new) ||
        chronologicalPostsSequence.length == 0 ||
        threadViewQuery.showCover,
    };
    setThreadViewQuery(
      getUpdatedQuery(threadViewQuery, getViewTypeFromString(defaultView), {
        threadViewMode: currentThreadViewMode,
        galleryViewMode,
        timelineViewMode,
      }),
      "replace"
    );
  }, [isFetching]);

  React.useEffect(() => {
    if (isFetching) {
      return;
    }
    setThreadViewQuery(
      getUpdatedQuery(threadViewQuery, getViewTypeFromString(defaultView), {
        threadViewMode: currentThreadViewMode,
        galleryViewMode: null,
        timelineViewMode: null,
      }),
      "replace"
    );
  }, [currentThreadViewMode]);

  const addOnChangeHandler = React.useCallback(
    (callback: (mode: THREAD_VIEW_MODES) => void) => {
      THREAD_VIEW_CHANGE_HANDLERS.push(callback);
    },
    []
  );

  const removeOnChangeHandler = React.useCallback(
    (callback: (mode: THREAD_VIEW_MODES) => void) => {
      THREAD_VIEW_CHANGE_HANDLERS = THREAD_VIEW_CHANGE_HANDLERS.filter(
        (savedCallback) => savedCallback != callback
      );
    },
    []
  );

  const setActiveFilter = React.useCallback(
    (filter: string | null) => {
      setThreadViewQuery(
        {
          ...threadViewQuery,
          filter: filter === null ? undefined : [filter],
        },
        "replaceIn"
      );
    },
    [threadViewQuery, setThreadViewQuery]
  );

  const setExcludedNotices = React.useCallback(
    (notices: string[] | null) => {
      setThreadViewQuery(
        {
          ...threadViewQuery,
          excludedNotices: notices === null ? undefined : notices,
        },
        "replaceIn"
      );
    },
    [threadViewQuery, setThreadViewQuery]
  );

  return (
    <ThreadViewContext.Provider
      value={React.useMemo(
        () => ({
          currentThreadViewMode,
          timelineViewMode: currentTimelineViewMode,
          galleryViewMode: currentGalleryViewMode,
          activeFilters:
            threadViewQuery.filter?.filter(
              (category): category is string => category !== null
            ) || null,
          excludedNotices:
            threadViewQuery.excludedNotices?.filter(
              (notice): notice is string => notice !== null
            ) || null,
          setActiveFilter,
          setExcludedNotices,
          setThreadViewMode,
          setGalleryViewMode,
          setTimelineViewMode,
          addOnChangeHandler,
          removeOnChangeHandler,
        }),
        [
          currentThreadViewMode,
          currentTimelineViewMode,
          currentGalleryViewMode,
          threadViewQuery.filter,
          threadViewQuery.excludedNotices,
          setActiveFilter,
          setExcludedNotices,
          setThreadViewMode,
          setGalleryViewMode,
          setTimelineViewMode,
          addOnChangeHandler,
          removeOnChangeHandler,
        ]
      )}
    >
      {children}
    </ThreadViewContext.Provider>
  );
};

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
