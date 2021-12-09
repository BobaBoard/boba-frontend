import { Client, getThreadRouter } from "../utils";
import { act, renderHook } from "@testing-library/react-hooks";
import {
  animationFrame,
  ensureMocksReset,
  requestIdleCallback,
} from "@shopify/jest-dom-mocks";

import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "../../server-mocks/data/thread";
import React from "react";
import ThreadContextProvider from "components/thread/ThreadContext";
// import { act } from "@testing-library/react";
import { matchRequestUrl } from "msw";
import { mocked } from "ts-jest/utils";
import { request } from "https";
import { server } from "../../server-mocks";
import { useDisplayManager } from "components/hooks/useDisplayMananger";

jest.mock("components/thread/ThreadViewContext.tsx", () => ({
  ...jest.requireActual("components/thread/ThreadViewContext"),
  useThreadViewContext: jest.fn(() => ({
    currentThreadViewMode: "THREAD",
    timelineViewMode: jest.fn(),
    galleryViewMode: jest.fn(),
    activeFilters: null,
    excludedNotices: null,
    setActiveFilter: jest.fn(),
    setExcludedNotices: jest.fn(),
    setThreadViewMode: jest.fn(),
    setGalleryViewMode: jest.fn(),
    setTimelineViewMode: jest.fn(),
    addOnChangeHandler: jest.fn(),
    removeOnChangeHandler: jest.fn(),
  })),
}));

beforeAll(() => {
  jest.useFakeTimers();
});

beforeEach(() => {
  requestIdleCallback.mock();
  animationFrame.mock();
});

afterEach(() => {
  requestIdleCallback.restore();
  animationFrame.restore();
  ensureMocksReset();
  jest.clearAllTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

function waitForRequest(method: string, url: string) {
  let requestId = "";
  return new Promise((resolve, reject) => {
    server.events.on("request:start", (req) => {
      const matchesMethod = req.method.toLowerCase() === method.toLowerCase();
      const matchesUrl = matchRequestUrl(req.url, url);
      if (matchesMethod && matchesUrl) {
        requestId = req.id;
      }
    });
    server.events.on("request:end", (req) => {
      if (req.id === requestId) {
        resolve(req);
      }
    });
    server.events.on("request:unhandled", (req) => {
      if (req.id === requestId) {
        reject(
          new Error(`The ${req.method} ${req.url.href} request was unhandled.`)
        );
      }
    });
  });
}

const getThreadRequestPromise = ({ threadId }: { threadId: string }) => {
  return waitForRequest("GET", `/threads/${threadId}`);
};
describe("useDisplayManager", () => {
  it("Renders first (and unique) batch of thread elements", async () => {
    const wrapper = ({ children }: any) => {
      return (
        <Client
          router={getThreadRouter({
            boardSlug: "gore",
            threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
          })}
        >
          <ThreadContextProvider
            boardId="gore"
            postId={null}
            threadId={FAVORITE_CHARACTER_TO_MAIM_THREAD.id}
          >
            {children}
          </ThreadContextProvider>
        </Client>
      );
    };
    const collapseManager = {
      onCollapseLevel: jest.fn(),
      onUncollapseLevel: jest.fn(),
      getCollapseReason: jest.fn(),
      onToggleCollapseLevel: jest.fn(),
      isCollapsed: jest.fn(),
      subscribeToCollapseChange: jest.fn(),
      unsubscribeFromCollapseChange: jest.fn(),
      reset: jest.fn(),
      addCollapseGroup: jest.fn(),
      getCollapseGroupAt: jest.fn(),
      getCollapseGroupId: jest.fn(),
      onPartiallyUncollapseGroup: jest.fn(),
      collapseGroups: [],
    };
    const threadFetched = getThreadRequestPromise({
      threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
    });
    const { result } = renderHook(() => useDisplayManager(collapseManager), {
      wrapper,
    });

    expect(result.current.maxDisplay).toBe(5);

    await act(() => threadFetched as Promise<void>);
    expect(result.current.hasMore()).toBe(false);
    expect(
      result.current.currentModeLoadedElements.map((post) => post.postId)
    ).toEqual([
      "11b85dac-e122-40e0-b09a-8829c5e0250e",
      "619adf62-833f-4bea-b591-03e807338a8e",
      "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
    ]);
  });

  it("Loads elements one by one when display more is called", async () => {
    const wrapper = ({ children }: any) => {
      return (
        <Client
          router={getThreadRouter({
            boardSlug: "gore",
            threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
          })}
        >
          <ThreadContextProvider
            boardId="gore"
            postId={null}
            threadId={FAVORITE_CHARACTER_TO_MAIM_THREAD.id}
          >
            {children}
          </ThreadContextProvider>
        </Client>
      );
    };
    const collapseManager = {
      onCollapseLevel: jest.fn(),
      onUncollapseLevel: jest.fn(),
      getCollapseReason: jest.fn(),
      onToggleCollapseLevel: jest.fn(),
      isCollapsed: jest.fn(),
      subscribeToCollapseChange: jest.fn(),
      unsubscribeFromCollapseChange: jest.fn(),
      reset: jest.fn(),
      addCollapseGroup: jest.fn(),
      getCollapseGroupAt: jest.fn(),
      getCollapseGroupId: jest.fn(),
      onPartiallyUncollapseGroup: jest.fn(),
      collapseGroups: [],
    };
    const threadFetched = getThreadRequestPromise({
      threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
    });
    const { result } = renderHook(
      () =>
        useDisplayManager(collapseManager, {
          firstLoadAmount: 1,
          loadMoreAmount: 1,
        }),
      {
        wrapper,
      }
    );

    expect(result.current.maxDisplay).toBe(1);

    await act(() => threadFetched as Promise<void>);
    expect(result.current.maxDisplay).toBe(1);
    expect(
      result.current.currentModeLoadedElements.map((post) => post.postId)
    ).toEqual(["11b85dac-e122-40e0-b09a-8829c5e0250e"]);
    expect(result.current.hasMore()).toBe(true);

    const displayMoreCallback = jest.fn();
    act(() => result.current.displayMore(displayMoreCallback));
    expect(displayMoreCallback).toHaveBeenCalledWith(2, true);
    expect(result.current.maxDisplay).toBe(2);
    expect(
      result.current.currentModeLoadedElements.map((post) => post.postId)
    ).toEqual([
      "11b85dac-e122-40e0-b09a-8829c5e0250e",
      "619adf62-833f-4bea-b591-03e807338a8e",
    ]);
    expect(result.current.hasMore()).toBe(true);

    act(() => result.current.displayMore(displayMoreCallback));
    expect(displayMoreCallback).toHaveBeenCalledWith(3, false);
    expect(result.current.maxDisplay).toBe(3);
    expect(
      result.current.currentModeLoadedElements.map((post) => post.postId)
    ).toEqual([
      "11b85dac-e122-40e0-b09a-8829c5e0250e",
      "619adf62-833f-4bea-b591-03e807338a8e",
      "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
    ]);
    expect(result.current.hasMore()).toBe(false);
  });

  it("Loads elements one by one when thread is idle", async () => {
    const wrapper = ({ children }: any) => {
      return (
        <Client
          router={getThreadRouter({
            boardSlug: "gore",
            threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
          })}
        >
          <ThreadContextProvider
            boardId="gore"
            postId={null}
            threadId={FAVORITE_CHARACTER_TO_MAIM_THREAD.id}
          >
            {children}
          </ThreadContextProvider>
        </Client>
      );
    };
    const collapseManager = {
      onCollapseLevel: jest.fn(),
      onUncollapseLevel: jest.fn(),
      getCollapseReason: jest.fn(),
      onToggleCollapseLevel: jest.fn(),
      isCollapsed: jest.fn(),
      subscribeToCollapseChange: jest.fn(),
      unsubscribeFromCollapseChange: jest.fn(),
      reset: jest.fn(),
      addCollapseGroup: jest.fn(),
      getCollapseGroupAt: jest.fn(),
      getCollapseGroupId: jest.fn(),
      onPartiallyUncollapseGroup: jest.fn(),
      collapseGroups: [],
    };
    const threadFetched = getThreadRequestPromise({
      threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
    });
    const { result } = renderHook(
      () =>
        useDisplayManager(collapseManager, {
          firstLoadAmount: 1,
          loadMoreAmount: 1,
        }),
      {
        wrapper,
      }
    );

    await act(() => threadFetched as Promise<void>);
    expect(result.current.maxDisplay).toBe(1);
    expect(
      result.current.currentModeLoadedElements.map((post) => post.postId)
    ).toEqual(["11b85dac-e122-40e0-b09a-8829c5e0250e"]);
    expect(result.current.hasMore()).toBe(true);

    act(() => {
      requestIdleCallback.runIdleCallbacks();
      animationFrame.runFrame();
    });
    expect(result.current.maxDisplay).toBe(2);
    expect(
      result.current.currentModeLoadedElements.map((post) => post.postId)
    ).toEqual([
      "11b85dac-e122-40e0-b09a-8829c5e0250e",
      "619adf62-833f-4bea-b591-03e807338a8e",
    ]);
    expect(result.current.hasMore()).toBe(true);

    act(() => {
      requestIdleCallback.runIdleCallbacks();
      animationFrame.runFrame();
    });
    expect(result.current.maxDisplay).toBe(3);
    expect(
      result.current.currentModeLoadedElements.map((post) => post.postId)
    ).toEqual([
      "11b85dac-e122-40e0-b09a-8829c5e0250e",
      "619adf62-833f-4bea-b591-03e807338a8e",
      "b95bb260-eae0-456c-a5d0-8ae9e52608d8",
    ]);
    expect(result.current.hasMore()).toBe(false);
  });
});
