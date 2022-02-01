import {
  GALLERY_VIEW_MODE,
  THREAD_VIEW_MODES,
  TIMELINE_VIEW_MODE,
  ThreadViewContextProvider,
  useThreadViewContext,
} from "components/thread/ThreadViewContext";
import {
  ThreadContextType,
  useThreadContext,
} from "components/thread/ThreadContext";
import { act, renderHook } from "@testing-library/react-hooks";

import React from "react";
import { mocked } from "ts-jest/utils";
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
  mocked(useThreadContext).mockImplementation(
    () => mockThreadContext as ThreadContextType
  );
  return mockThreadContext;
};

const NEUTRAL_QUERY_PARAMS_STATE = {
  excludedNotices: undefined,
  filter: undefined,
  gallery: false,
  thread: false,
  all: false,
  timeline: false,
  latest: false,
  new: false,
};

const getThreadViewContextWrapper = () => {
  return function ContextWrapper({ children }: { children: React.ReactNode }) {
    return <ThreadViewContextProvider>{children}</ThreadViewContextProvider>;
  };
};

describe("useThreadViewContext", () => {
  let mockedThreadContext: Partial<ThreadContextType>;
  beforeEach(() => {
    mockedThreadContext = mockThreadContext();
  });

  it("Returns thread view mode if none is specified", async () => {
    mockThreadContext();
    const { result } = renderHook(() => useThreadViewContext(), {
      wrapper: getThreadViewContextWrapper(),
    });

    expect(result.current.currentThreadViewMode).toBe(THREAD_VIEW_MODES.THREAD);
  });

  it("Returns default view mode if none is specified in query params", async () => {
    mockedThreadContext.defaultView = "gallery";
    const { result } = renderHook(() => useThreadViewContext(), {
      wrapper: getThreadViewContextWrapper(),
    });

    expect(result.current.currentThreadViewMode).toBe(
      THREAD_VIEW_MODES.MASONRY
    );
    expect(result.current.galleryViewMode).toStrictEqual({
      mode: GALLERY_VIEW_MODE.ALL,
      showCover: false,
    });
  });

  it("Returns view mode in the params if specified in query params", async () => {
    mockedThreadContext.defaultView = "gallery";
    mocked(useQueryParams).mockImplementation(() => [
      { timeline: true },
      jest.fn(),
    ]);
    const { result } = renderHook(() => useThreadViewContext(), {
      wrapper: getThreadViewContextWrapper(),
    });

    expect(result.current.currentThreadViewMode).toBe(
      THREAD_VIEW_MODES.TIMELINE
    );
    expect(result.current.timelineViewMode).toBe(TIMELINE_VIEW_MODE.ALL);
  });

  it("Adds view mode to the params if different from default", async () => {
    mockedThreadContext.defaultView = "gallery";
    const setQueryParams = jest.fn();
    mocked(useQueryParams).mockImplementation(() => [
      { timeline: true },
      setQueryParams,
    ]);
    renderHook(() => useThreadViewContext(), {
      wrapper: getThreadViewContextWrapper(),
    });

    expect(setQueryParams).toHaveBeenLastCalledWith(
      {
        ...NEUTRAL_QUERY_PARAMS_STATE,
        all: true,
        timeline: true,
      },
      "replace"
    );
  });

  it("Switch to new for timeline if there are updated posts", async () => {
    mockedThreadContext.defaultView = "gallery";
    mockedThreadContext.hasNewReplies = true;
    const setQueryParams = jest.fn();
    mocked(useQueryParams).mockImplementation(() => [
      { timeline: true },
      setQueryParams,
    ]);
    const { result } = renderHook(() => useThreadViewContext(), {
      wrapper: getThreadViewContextWrapper(),
    });

    expect(result.current.currentThreadViewMode).toBe(
      THREAD_VIEW_MODES.TIMELINE
    );
    expect(result.current.timelineViewMode).toBe(TIMELINE_VIEW_MODE.NEW);
    expect(setQueryParams).toHaveBeenLastCalledWith(
      {
        ...NEUTRAL_QUERY_PARAMS_STATE,
        new: true,
        timeline: true,
      },
      "replace"
    );
  });

  // TODO: test above but for gallery

  describe("State updates", () => {
    let mockedThreadContext: Partial<ThreadContextType>;
    beforeEach(() => {
      mockedThreadContext = mockThreadContext();
    });

    it("Correctly switches view mode for gallery", async () => {
      mockedThreadContext.defaultView = "thread";
      const setQueryParams = jest.fn();
      mocked(useQueryParams).mockImplementation(() => [
        { timeline: true },
        setQueryParams,
      ]);
      const { result } = renderHook(() => useThreadViewContext(), {
        wrapper: getThreadViewContextWrapper(),
      });

      act(() => {
        result.current.setGalleryViewMode({
          mode: GALLERY_VIEW_MODE.NEW,
          showCover: true,
        });
      });
      expect(result.current.currentThreadViewMode).toBe(
        THREAD_VIEW_MODES.MASONRY
      );

      // TODO: this should be only called once with the query already set
      expect(setQueryParams).toHaveBeenLastCalledWith(
        {
          ...NEUTRAL_QUERY_PARAMS_STATE,
          // TODO: this is here because it does not exist for masonry view
          latest: undefined,
          new: true,
          gallery: true,
          showCover: true,
        },
        "replace"
      );
    });

    it("Correctly switches view mode for timeline", async () => {
      mockedThreadContext.defaultView = "gallery";
      const setQueryParams = jest.fn();
      mocked(useQueryParams).mockImplementation(() => [{}, setQueryParams]);
      const { result } = renderHook(() => useThreadViewContext(), {
        wrapper: getThreadViewContextWrapper(),
      });

      act(() => {
        result.current.setTimelineViewMode(TIMELINE_VIEW_MODE.NEW);
      });

      // TODO: this should be only called once with the query already set
      expect(setQueryParams).toHaveBeenLastCalledWith(
        {
          ...NEUTRAL_QUERY_PARAMS_STATE,
          new: true,
          timeline: true,
        },
        "replace"
      );
    });

    it("Correctly switches back to thread", async () => {
      mockedThreadContext.defaultView = "gallery";
      const setQueryParams = jest.fn();
      mocked(useQueryParams).mockImplementation(() => [
        { timeline: true },
        setQueryParams,
      ]);
      const { result } = renderHook(() => useThreadViewContext(), {
        wrapper: getThreadViewContextWrapper(),
      });

      act(() => {
        result.current.setThreadViewMode(THREAD_VIEW_MODES.THREAD);
      });

      // TODO: this should be only called once with the query already set
      expect(setQueryParams).toHaveBeenLastCalledWith(
        {
          // TODO: this should be the same value as neutral
          gallery: false,
          timeline: false,
          thread: true,
        },
        "replace"
      );
    });
  });

  // TODO: add more tests
  // - active filters
  // - active content notices
  // - callbacks
});
