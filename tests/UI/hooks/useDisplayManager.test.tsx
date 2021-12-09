import { Client, getThreadRequestPromise, getThreadRouter } from "../utils";
import { act, renderHook } from "@testing-library/react-hooks";
import { animationFrame, requestIdleCallback } from "@shopify/jest-dom-mocks";

import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "../../server-mocks/data/thread";
import React from "react";
import ThreadContextProvider from "components/thread/ThreadContext";
import { useDisplayManager } from "components/hooks/useDisplayMananger";

jest.mock("components/thread/ThreadViewContext.tsx");

const getMockCollapseManager = () => ({
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
});

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
        <ThreadContextProvider boardId="gore" postId={null} threadId={threadId}>
          {children}
        </ThreadContextProvider>
      </Client>
    );
  };
};

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
  jest.clearAllTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe("useDisplayManager", () => {
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
