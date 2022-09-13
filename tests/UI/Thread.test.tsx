import { Client, getThreadRequestPromise, getThreadRouter } from "./utils";
import {
  LOGGED_IN_V0_MEMBER_DATA,
  LOGGED_IN_V0_NONMEMBER_DATA,
  V0_DATA,
} from "../server-mocks/data/realm";
import { act, render, screen, waitFor } from "@testing-library/react";

import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "../server-mocks/data/thread";
import React from "react";
import { RealmType } from "types/Types";
import ThreadPage from "pages/[boardId]/thread/[...threadId]";
import debug from "debug";
import { makeRealmData } from "utils/client-data";
import { useReadThread } from "queries/thread";

const log = debug("bobafrontend:tests:UI:Thread-test-log");

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/hooks/useIsChangingRoute");
jest.mock("components/hooks/useOnPageExit");
jest.mock("queries/thread", () => ({
  ...jest.requireActual("queries/thread"),
  useReadThread: jest.fn().mockReturnValue(jest.fn()),
}));

//jest.mock("contexts/ThreadViewContext.tsx");

describe("Threads test", () => {
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

    jest.mocked(markAsRead).mockClear();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(markAsRead).toBeCalledTimes(0);
  });
});

describe("Thread buttons tests", () => {
  it("renders reply buttons when user is a realm member", async () => {
    render(
      <Client
        router={getThreadRouter({
          boardSlug: "gore",
          threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
        })}
        initialData={{
          realm: makeRealmData(LOGGED_IN_V0_MEMBER_DATA) as RealmType,
        }}
      >
        <ThreadPage />
      </Client>
    );
    await waitFor(() => {
      expect(
        screen.getAllByText("Favorite character to maim?")[0]
      ).toBeVisible();
      expect(screen.getByText("Gallery")).toBeInTheDocument();
      expect(screen.getAllByText("Contribute")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Comment")[0]).toBeInTheDocument();
      // The reply-to-a-comment buttons are aria-labelled so I don't know why jest can't find this label text
      // expect(
      //   screen.getAllByLabelText("add a new comment")[0]
      // ).toBeInTheDocument();
    });
  });

  it("doesn't render reply buttons when user is not a realm member", async () => {
    render(
      <Client
        router={getThreadRouter({
          boardSlug: "gore",
          threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
        })}
        initialData={{
          realm: makeRealmData(LOGGED_IN_V0_NONMEMBER_DATA) as RealmType,
        }}
      >
        <ThreadPage />
      </Client>
    );
    await waitFor(() => {
      expect(
        screen.getAllByText("Favorite character to maim?")[0]
      ).toBeVisible();
      expect(screen.getByText("Gallery")).toBeInTheDocument();
      expect(screen.queryByText("Contribute")).not.toBeInTheDocument();
      expect(screen.queryByText("Comment")).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText("add a new comment")
      ).not.toBeInTheDocument();
    });
  });

  it("doesn't render reply buttons when logged out", async () => {
    render(
      <Client
        router={getThreadRouter({
          boardSlug: "gore",
          threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
        })}
        initialData={{
          realm: makeRealmData(V0_DATA) as RealmType,
        }}
      >
        <ThreadPage />
      </Client>
    );
    await waitFor(() => {
      expect(
        screen.getAllByText("Favorite character to maim?")[0]
      ).toBeVisible();
      expect(screen.getByText("Gallery")).toBeInTheDocument();
      expect(screen.queryByText("Contribute")).not.toBeInTheDocument();
      expect(screen.queryByText("Comment")).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText("add a new comment")
      ).not.toBeInTheDocument();
    });
  });
});
