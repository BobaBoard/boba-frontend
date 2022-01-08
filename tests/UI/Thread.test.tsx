import { Client, getThreadRequestPromise, getThreadRouter } from "./utils";
import { act, render, screen, waitFor } from "@testing-library/react";

import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "../server-mocks/data/thread";
import React from "react";
import ThreadPage from "pages/[boardId]/thread/[...threadId]";
import { mocked } from "ts-jest/utils";
import { requestIdleCallback } from "@shopify/jest-dom-mocks";
import { useReadThread } from "queries/thread";

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/hooks/useIsChangingRoute");
jest.mock("components/hooks/useOnPageExit");
jest.mock("queries/thread", () => ({
  ...jest.requireActual("queries/thread"),
  useReadThread: jest.fn().mockReturnValue(jest.fn()),
}));

//jest.mock("components/thread/ThreadViewContext.tsx");

beforeAll(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe("Threads test", () => {
  it("displays loading indicator while thread is being fetched", async () => {
    const threadFetched = getThreadRequestPromise({
      threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
    });

    render(
      <Client
        router={getThreadRouter({
          boardSlug: "gore",
          threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
        })}
      >
        <ThreadPage />
      </Client>
    );

    await waitFor(async () => {
      const loadingBar = await screen.findByRole("progressbar", {
        name: "bottom page loading bar",
      });
      expect(loadingBar).toHaveAttribute("aria-busy", "true");
      expect(loadingBar).toHaveAttribute("aria-valuenow", "0");
    });

    await act(() => threadFetched as Promise<void>);

    await waitFor(async () => {
      const loadedBar = await screen.findByRole("progressbar", {
        name: "bottom page loading bar",
      });
      expect(loadedBar).toHaveAttribute("aria-busy", "false");
      expect(loadedBar).toHaveAttribute("aria-valuenow", "100");
    });
  });

  it("marks thread as read after first load", async () => {
    const threadFetched = getThreadRequestPromise({
      threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
    });
    render(
      <Client
        router={getThreadRouter({
          boardSlug: "gore",
          threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
        })}
      >
        <ThreadPage />
      </Client>
    );

    const markAsRead = useReadThread();
    await act(() => threadFetched as Promise<void>);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(markAsRead).toBeCalledTimes(1);
  });

  it("marks thread as read again on thread id change", async () => {
    const threadFetched = getThreadRequestPromise({
      threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
    });
    const { rerender } = render(
      <Client
        router={getThreadRouter({
          boardSlug: "gore",
          threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
        })}
      >
        <ThreadPage />
      </Client>
    );

    const markAsRead = useReadThread();
    await act(() => threadFetched as Promise<void>);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(markAsRead).toBeCalledTimes(1);

    rerender(
      <Client
        router={getThreadRouter({
          boardSlug: "gore",
          threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
        })}
      >
        <ThreadPage />
      </Client>
    );

    mocked(markAsRead).mockClear();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(markAsRead).toBeCalledTimes(0);
  });
});
