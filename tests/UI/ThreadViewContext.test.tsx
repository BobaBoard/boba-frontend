import {
  GALLERY_VIEW_SUB_MODE,
  THREAD_VIEW_MODE,
  TIMELINE_VIEW_SUB_MODE,
  ThreadViewContextProvider,
  useThreadViewContext,
} from "contexts/ThreadViewContext";
import {
  ThreadContextType,
  useThreadContext,
} from "components/thread/ThreadContext";
import { act, renderHook } from "@testing-library/react-hooks/native";

import React from "react";
import { ViewQueryParamsType } from "types/ThreadQueryParams";
import { useQueryParams } from "use-query-params";

jest.mock("components/thread/ThreadContext.tsx");
jest.mock("use-query-params", () => ({
  useQueryParams: jest.fn().mockImplementation(() => [{}, jest.fn()]),
}));

const mockThreadContext = () => {
  const mockThreadContext: Partial<ThreadContextType> = {
    isLoading: false,
    isRefetching: false,
    defaultView: null,
    chronologicalPostsSequence: [],
  };
  jest
    .mocked(useThreadContext)
    .mockImplementation(() => mockThreadContext as ThreadContextType);
  return mockThreadContext;
};

/**
 * This and the following are the states we can expect by default for each type of
 * view mode.
 * Note that the defaults don't actually set the corresponding view mode to true,
 * because they assume that view mode is the default view mode, which should not
 * appear in the final URL. If it should be explicitly specified, then the param
 * should explicitly be set to true.
 */
const NEUTRAL_QUERY_PARAMS_STATE = {
  gallery: false,
  timeline: false,
  thread: false,
  all: false,
  new: false,
  showCover: false,
  latest: false,
};
const NEUTRAL_QUERY_PARAMS_STATE_WITH_THREAD = {
  ...NEUTRAL_QUERY_PARAMS_STATE,
};

const NEUTRAL_QUERY_PARAMS_STATE_WITH_GALLERY = {
  ...NEUTRAL_QUERY_PARAMS_STATE,
  all: false,
  new: false,
  showCover: false,
};
const NEUTRAL_QUERY_PARAMS_STATE_WITH_TIMELINE = {
  ...NEUTRAL_QUERY_PARAMS_STATE,
  all: false,
  new: false,
  latest: false,
};

const getThreadViewContextWrapper = () => {
  return function ContextWrapper({ children }: { children: React.ReactNode }) {
    return <ThreadViewContextProvider>{children}</ThreadViewContextProvider>;
  };
};

const mockQueryParams = (initialState?: Partial<ViewQueryParamsType>) => {
  const setQueryParams = jest.fn((newState) => mockChangeQueryParams(newState));
  jest
    .mocked(useQueryParams)
    .mockImplementation(() => [initialState || {}, setQueryParams]);

  return setQueryParams;
};
const mockChangeQueryParams = (newState?: Partial<ViewQueryParamsType>) => {
  const setQueryParams = jest.fn();
  jest
    .mocked(useQueryParams)
    .mockImplementation(() => [newState || {}, setQueryParams]);
};

describe("useThreadViewContext", () => {
  let mockedThreadContext: Partial<ThreadContextType>;
  let setQueryParams: jest.Mock;
  beforeEach(() => {
    mockedThreadContext = mockThreadContext();
    setQueryParams = mockQueryParams();
  });

  it("Returns thread view mode if none is specified", async () => {
    mockThreadContext();
    const { result } = renderHook(() => useThreadViewContext(), {
      wrapper: getThreadViewContextWrapper(),
    });

    expect(result.current.currentThreadViewMode).toBe(THREAD_VIEW_MODE.THREAD);
  });

  it("Returns default view mode if none is specified in query params", async () => {
    mockedThreadContext.defaultView = "gallery";

    const { result } = renderHook(() => useThreadViewContext(), {
      wrapper: getThreadViewContextWrapper(),
    });

    expect(result.current.currentThreadViewMode).toBe(THREAD_VIEW_MODE.MASONRY);
    expect(result.current.galleryViewMode).toStrictEqual({
      mode: GALLERY_VIEW_SUB_MODE.ALL,
      showCover: false,
    });
  });

  it("Returns view mode in the params if specified", async () => {
    mockedThreadContext.defaultView = "gallery";
    // const setQueryParams = mockQueryParams({ timeline: true });

    const { result } = renderHook(() => useThreadViewContext(), {
      wrapper: getThreadViewContextWrapper(),
    });

    expect(result.current.currentThreadViewMode).toBe(
      THREAD_VIEW_MODE.TIMELINE
    );
    expect(result.current.timelineViewMode).toBe(TIMELINE_VIEW_SUB_MODE.ALL);
  });

  describe("Default states", () => {
    it("Defaults to new for timeline if there are updated posts", async () => {
      mockedThreadContext.defaultView = "timeline";
      mockedThreadContext.hasNewReplies = true;
      const setQueryParams = mockQueryParams();
      const { result } = renderHook(() => useThreadViewContext(), {
        wrapper: getThreadViewContextWrapper(),
      });

      expect(result.current.currentThreadViewMode).toBe(
        THREAD_VIEW_MODE.TIMELINE
      );
      expect(result.current.timelineViewMode).toBe(TIMELINE_VIEW_SUB_MODE.NEW);

      expect(setQueryParams).toHaveBeenCalledTimes(1);
      expect(setQueryParams).toHaveBeenLastCalledWith(
        {
          ...NEUTRAL_QUERY_PARAMS_STATE_WITH_TIMELINE,
          new: true,
        },
        "pushIn"
      );
    });

    it("Defaults to new for gallery if there are updated posts", async () => {
      mockedThreadContext.defaultView = "gallery";
      mockedThreadContext.hasNewReplies = true;
      // const setQueryParams = mockQueryParams();
      const { result } = renderHook(() => useThreadViewContext(), {
        wrapper: getThreadViewContextWrapper(),
      });

      expect(result.current.currentThreadViewMode).toBe(
        THREAD_VIEW_MODE.MASONRY
      );
      expect(result.current.galleryViewMode).toEqual({
        mode: GALLERY_VIEW_SUB_MODE.NEW,
        showCover: false,
      });
    });

    it("Defaults to show cover for gallery if root is updated", async () => {
      mockedThreadContext.defaultView = "gallery";
      mockedThreadContext.hasNewReplies = true;
      // @ts-expect-error
      mockedThreadContext.threadRoot = { isNew: true };
      const setQueryParams = mockQueryParams();
      const { result } = renderHook(() => useThreadViewContext(), {
        wrapper: getThreadViewContextWrapper(),
      });

      expect(result.current.currentThreadViewMode).toBe(
        THREAD_VIEW_MODE.MASONRY
      );
      expect(result.current.galleryViewMode).toEqual({
        mode: GALLERY_VIEW_SUB_MODE.NEW,
        showCover: true,
      });

      expect(setQueryParams).toHaveBeenCalledTimes(1);
      expect(setQueryParams).toHaveBeenLastCalledWith(
        {
          ...NEUTRAL_QUERY_PARAMS_STATE_WITH_GALLERY,
          new: true,
          showCover: true,
        },
        "pushIn"
      );
    });

    it("Defaults to thread for thread view mode even if there's updates", async () => {
      mockedThreadContext.defaultView = "thread";
      mockedThreadContext.hasNewReplies = true;
      // @ts-expect-error
      mockedThreadContext.threadRoot = { isNew: true };
      // const setQueryParams = mockQueryParams();
      const { result } = renderHook(() => useThreadViewContext(), {
        wrapper: getThreadViewContextWrapper(),
      });

      expect(result.current.currentThreadViewMode).toBe(
        THREAD_VIEW_MODE.THREAD
      );
    });
  });

  describe("View modes updates", () => {
    it("Correctly switches view mode for gallery with explicit show cover", async () => {
      mockedThreadContext.defaultView = "thread";
      const setQueryParams = mockQueryParams({ timeline: true });
      const { result, rerender } = renderHook(() => useThreadViewContext(), {
        wrapper: getThreadViewContextWrapper(),
      });

      act(() => {
        result.current.setGalleryViewMode({
          mode: GALLERY_VIEW_SUB_MODE.NEW,
          showCover: true,
        });
      });

      expect(setQueryParams).toHaveBeenCalledTimes(1);
      expect(setQueryParams).toHaveBeenLastCalledWith(
        {
          ...NEUTRAL_QUERY_PARAMS_STATE_WITH_GALLERY,
          gallery: true,
          new: true,
          showCover: true,
        },
        "pushIn"
      );
      rerender();
      expect(result.current.currentThreadViewMode).toBe(
        THREAD_VIEW_MODE.MASONRY
      );
      expect(result.current.galleryViewMode).toEqual({
        mode: GALLERY_VIEW_SUB_MODE.NEW,
        showCover: true,
      });
    });

    it("Correctly switches view mode for gallery without explicit show cover (new)", async () => {
      mockedThreadContext.defaultView = "thread";
      mockedThreadContext.hasNewReplies = true;
      // @ts-expect-error
      mockedThreadContext.threadRoot = { isNew: true };
      const setQueryParams = mockQueryParams({ timeline: true });
      const { result, rerender } = renderHook(() => useThreadViewContext(), {
        wrapper: getThreadViewContextWrapper(),
      });

      act(() => {
        result.current.setGalleryViewMode({
          mode: GALLERY_VIEW_SUB_MODE.NEW,
        });
      });

      expect(setQueryParams).toHaveBeenCalledTimes(2);
      expect(setQueryParams).toHaveBeenLastCalledWith(
        {
          ...NEUTRAL_QUERY_PARAMS_STATE_WITH_GALLERY,
          gallery: true,
          new: true,
          showCover: true,
        },
        "pushIn"
      );
      rerender();
      expect(result.current.currentThreadViewMode).toBe(
        THREAD_VIEW_MODE.MASONRY
      );
      expect(result.current.galleryViewMode).toEqual({
        mode: GALLERY_VIEW_SUB_MODE.NEW,
        showCover: true,
      });
    });

    it("Correctly switches view mode for gallery without explicit show cover (not new)", async () => {
      mockedThreadContext.defaultView = "thread";
      const setQueryParams = mockQueryParams({ timeline: true });
      const { result, rerender } = renderHook(() => useThreadViewContext(), {
        wrapper: getThreadViewContextWrapper(),
      });

      act(() => {
        result.current.setGalleryViewMode({
          mode: GALLERY_VIEW_SUB_MODE.NEW,
          showCover: false,
        });
      });

      expect(setQueryParams).toHaveBeenCalledTimes(1);
      expect(setQueryParams).toHaveBeenLastCalledWith(
        {
          ...NEUTRAL_QUERY_PARAMS_STATE_WITH_GALLERY,
          gallery: true,
          new: true,
        },
        "pushIn"
      );

      rerender();
      expect(result.current.currentThreadViewMode).toBe(
        THREAD_VIEW_MODE.MASONRY
      );
      expect(result.current.galleryViewMode).toEqual({
        mode: GALLERY_VIEW_SUB_MODE.NEW,
        showCover: false,
      });
    });

    it("Correctly switches view mode for timeline", async () => {
      mockedThreadContext.defaultView = "gallery";
      const { result, rerender } = renderHook(() => useThreadViewContext(), {
        wrapper: getThreadViewContextWrapper(),
      });

      act(() => {
        result.current.setTimelineViewMode(TIMELINE_VIEW_SUB_MODE.NEW);
      });

      expect(setQueryParams).toHaveBeenCalledTimes(1);
      expect(setQueryParams).toHaveBeenLastCalledWith(
        {
          ...NEUTRAL_QUERY_PARAMS_STATE_WITH_TIMELINE,
          timeline: true,
          new: true,
        },
        "pushIn"
      );
      rerender();
      expect(result.current.timelineViewMode).toBe(TIMELINE_VIEW_SUB_MODE.NEW);
    });

    it("Correctly switches to thread", async () => {
      mockedThreadContext.defaultView = "gallery";
      const setQueryParams = mockQueryParams({ timeline: true });
      const { result, rerender } = renderHook(() => useThreadViewContext(), {
        wrapper: getThreadViewContextWrapper(),
      });

      act(() => {
        result.current.setThreadViewMode(THREAD_VIEW_MODE.THREAD);
      });

      expect(setQueryParams).toHaveBeenCalledTimes(1);
      expect(setQueryParams).toHaveBeenLastCalledWith(
        { ...NEUTRAL_QUERY_PARAMS_STATE_WITH_THREAD, thread: true },
        "pushIn"
      );
      rerender();
      expect(result.current.currentThreadViewMode).toBe(
        THREAD_VIEW_MODE.THREAD
      );
    });
  });

  describe("View sub modes updates", () => {
    it("Correctly retains showCover when switching mode in gallery view", async () => {
      mockedThreadContext.defaultView = "thread";
      const setQueryParams = mockQueryParams({
        gallery: true,
        all: true,
        showCover: true,
      });
      const { result, rerender } = renderHook(() => useThreadViewContext(), {
        wrapper: getThreadViewContextWrapper(),
      });

      act(() => {
        result.current.setGalleryViewMode({
          mode: GALLERY_VIEW_SUB_MODE.NEW,
        });
      });

      expect(setQueryParams).toHaveBeenCalledTimes(1);
      expect(setQueryParams).toHaveBeenLastCalledWith(
        {
          ...NEUTRAL_QUERY_PARAMS_STATE_WITH_GALLERY,
          gallery: true,
          new: true,
          showCover: true,
        },
        "pushIn"
      );
      rerender();
      expect(result.current.currentThreadViewMode).toBe(
        THREAD_VIEW_MODE.MASONRY
      );
      expect(result.current.galleryViewMode).toEqual({
        mode: GALLERY_VIEW_SUB_MODE.NEW,
        showCover: true,
      });
    });
  });
});

// TODO: Update to reflect addition of FilterableContext/test FilterableContext separately
//   describe("Filters updates", () => {
//     it("Adds filters without adding explicit view mode for default view (filters)", async () => {
//       mockedThreadContext.defaultView = "gallery";
//       const setQueryParams = mockQueryParams();
//       const { result } = renderHook(() => useThreadViewContext(), {
//         wrapper: getThreadViewContextWrapper(),
//       });

//       act(() => {
//         result.current.setActiveFilter("test");
//       });

//       expect(setQueryParams).toHaveBeenCalledTimes(2);
//       expect(setQueryParams).toHaveBeenLastCalledWith(
//         {
//           ...NEUTRAL_QUERY_PARAMS_STATE_WITH_GALLERY,
//           filter: ["test"],
//         },
//         "replace"
//       );
//     });

//     it("Adds filters and keeps explicit parameters", async () => {
//       mockedThreadContext.defaultView = "gallery";
//       const setQueryParams = mockQueryParams({ timeline: true, new: true });
//       const { result } = renderHook(() => useThreadViewContext(), {
//         wrapper: getThreadViewContextWrapper(),
//       });

//       act(() => {
//         result.current.setActiveFilter("test");
//       });

//       expect(setQueryParams).toHaveBeenCalledTimes(2);
//       expect(setQueryParams).toHaveBeenLastCalledWith(
//         {
//           ...NEUTRAL_QUERY_PARAMS_STATE_WITH_TIMELINE,
//           timeline: true,
//           new: true,
//           filter: ["test"],
//         },
//         "replace"
//       );
//     });
//   });

//   describe("Excluded content notices updates", () => {
//     it("Adds filters without adding explicit view mode for default view (notices)", async () => {
//       mockedThreadContext.defaultView = "gallery";
//       const setQueryParams = mockQueryParams();
//       const { result } = renderHook(() => useThreadViewContext(), {
//         wrapper: getThreadViewContextWrapper(),
//       });

//       act(() => {
//         result.current.setExcludedNotices(["test1", "test2", "test3"]);
//       });

//       expect(setQueryParams).toHaveBeenCalledTimes(2);
//       expect(setQueryParams).toHaveBeenLastCalledWith(
//         {
//           ...NEUTRAL_QUERY_PARAMS_STATE_WITH_GALLERY,
//           excludedNotices: ["test1", "test2", "test3"],
//         },
//         "replace"
//       );
//     });

//     it("Adds filters and keeps explicit parameters", async () => {
//       mockedThreadContext.defaultView = "gallery";
//       const setQueryParams = mockQueryParams({ timeline: true, new: true });
//       const { result } = renderHook(() => useThreadViewContext(), {
//         wrapper: getThreadViewContextWrapper(),
//       });

//       act(() => {
//         result.current.setExcludedNotices(["test1", "test2", "test3"]);
//       });

//       expect(setQueryParams).toHaveBeenCalledTimes(2);
//       expect(setQueryParams).toHaveBeenLastCalledWith(
//         {
//           ...NEUTRAL_QUERY_PARAMS_STATE_WITH_TIMELINE,
//           timeline: true,
//           new: true,
//           excludedNotices: ["test1", "test2", "test3"],
//         },
//         "replace"
//       );
//     });
//   });
