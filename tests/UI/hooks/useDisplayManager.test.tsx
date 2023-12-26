import { Client, getThreadRequestPromise, getThreadRouter } from "../utils";
import { act, renderHook } from "@testing-library/react-hooks";
import { animationFrame, requestIdleCallback } from "@shopify/jest-dom-mocks";

import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "../../server-mocks/data/thread";
import React from "react";
import ThreadContextProvider from "components/thread/ThreadContext";
import { useDisplayManager } from "components/hooks/useDisplayMananger";
import { FilterableContextProvider } from "components/core/feeds/FilterableContext";

vi.mock("contexts/ThreadViewContext.tsx");

// TODO: figure out where this gets cleared and why we have to add it again
const MockMatchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // Deprecated
  removeListener: vi.fn(), // Deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
vi.stubGlobal(`matchMedia`, MockMatchMedia);

const getMockCollapseManager = () => ({
  onCollapseLevel: vi.fn(),
  onUncollapseLevel: vi.fn(),
  getCollapseReason: vi.fn(),
  onToggleCollapseLevel: vi.fn(),
  isCollapsed: vi.fn(),
  subscribeToCollapseChange: vi.fn(),
  unsubscribeFromCollapseChange: vi.fn(),
  reset: vi.fn(),
  addCollapseGroup: vi.fn(),
  getCollapseGroupAt: vi.fn(),
  getCollapseGroupId: vi.fn(),
  onPartiallyUncollapseGroup: vi.fn(),
  collapseGroups: [],
});

// TODO: Need to update this to include filterableContext before these tests can have the skip removed
const getThreadContextWrapper = (threadId: string) => {
  // TODO: maybe remove board slug and board id
  return function ContextWrapper({ children }: { children: React.ReactNode }) {
    return (
      <Client
        router={getThreadRouter({
          boardSlug: "gore",
          threadId,
        })}
      >
        <FilterableContextProvider>
          <ThreadContextProvider
            boardId="gore"
            postId={null}
            commentId={null}
            threadId={threadId}
          >
            {children}
          </ThreadContextProvider>
        </FilterableContextProvider>
      </Client>
    );
  };
};

// beforeAll(() => {
//   jest.useFakeTimers();
// });

// beforeEach(() => {
//   requestIdleCallback.mock();
//   animationFrame.mock();
// });

// afterEach(() => {
//   requestIdleCallback.restore();
//   animationFrame.restore();
//   jest.clearAllTimers();
// });

// afterAll(() => {
//   jest.useRealTimers();
// });

describe("useDisplayManager", () => {
  beforeEach(() => {
    requestIdleCallback.mock();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    animationFrame.mock();
  });
  afterEach(() => {
    requestIdleCallback.cancelIdleCallbacks();
    requestIdleCallback.restore();
    animationFrame.restore();
  });
  it("Renders first (and unique) batch of thread elements", async () => {
    const threadFetched = getThreadRequestPromise({
      threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
    });
    const { result } = renderHook(
      () => useDisplayManager(getMockCollapseManager()),
      {
        wrapper: getThreadContextWrapper(FAVORITE_CHARACTER_TO_MAIM_THREAD.id),
      }
    );

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
    const threadFetched = getThreadRequestPromise({
      threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
    });
    const { result } = renderHook(
      () =>
        useDisplayManager(getMockCollapseManager(), {
          firstLoadAmount: 1,
          loadMoreAmount: 1,
        }),
      {
        wrapper: getThreadContextWrapper(FAVORITE_CHARACTER_TO_MAIM_THREAD.id),
      }
    );

    expect(result.current.maxDisplay).toBe(1);

    await act(() => threadFetched as Promise<void>);
    expect(result.current.maxDisplay).toBe(1);
    expect(
      result.current.currentModeLoadedElements.map((post) => post.postId)
    ).toEqual(["11b85dac-e122-40e0-b09a-8829c5e0250e"]);
    expect(result.current.hasMore()).toBe(true);

    const displayMoreCallback = vi.fn();
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
    const threadFetched = getThreadRequestPromise({
      threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
    });
    const { result } = renderHook(
      () =>
        useDisplayManager(getMockCollapseManager(), {
          firstLoadAmount: 1,
          loadMoreAmount: 1,
        }),
      {
        wrapper: getThreadContextWrapper(FAVORITE_CHARACTER_TO_MAIM_THREAD.id),
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
      vi.advanceTimersByTime(1000);
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
      vi.advanceTimersByTime(1000);
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
