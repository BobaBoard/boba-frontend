import { Client, getThreadRouter } from "./utils";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";

import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "../server-mocks/data/thread";
import { LOGGED_IN_V0_MEMBER_DATA } from "../server-mocks/data/realm";
import React from "react";
import { RealmType } from "types/Types";
import ThreadPage from "pages/[boardId]/thread/[...threadId]";
import { makeRealmData } from "lib/api/client-data";
import userEvent from "@testing-library/user-event";

vi.mock("components/hooks/usePreventPageChange");
vi.mock("components/core/useIsChangingRoute");
vi.mock("components/hooks/useOnPageExit");

describe("Comments editor", () => {
  it("renders comments after replying to thread (single comment)", async () => {
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
      expect(screen.getAllByText("Comment")[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("Comment")[0]);

    await waitFor(() => {
      expect(screen.getByLabelText("Submit")).toBeVisible();
    });

    const modal = document.querySelector<HTMLElement>(".ReactModalPortal");
    const editorContainer = document.querySelector<HTMLElement>(
      ".ReactModalPortal .ql-editor"
    );
    expect(editorContainer).toBeInTheDocument();

    await waitFor(async () => {
      await userEvent.type(editorContainer!, "bar1");
    });

    await waitFor(() => {
      expect(within(modal!).getByLabelText("Submit")).not.toBeDisabled();
    });

    // TODO: Do not believe eslint lies
    act(() => {
      fireEvent.click(within(modal!).getByLabelText("Submit"));
    });

    await waitForElementToBeRemoved(() =>
      document.querySelector<HTMLElement>(".ReactModalPortal .ql-editor")
    );

    const mainContainer = document.querySelector<HTMLElement>(".content main");
    await waitFor(() => {
      expect(within(mainContainer!).getByText("bar1")).toBeInTheDocument();
    });
  }, 10000);

  it("renders comments after replying to thread (multiple comments)", async () => {
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
      expect(screen.getAllByText("Comment")[0]).toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(screen.getAllByText("Comment")[0]);
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Submit")).toBeVisible();
    });

    const modal = document.querySelector<HTMLElement>(".ReactModalPortal");
    let editorContainer = document.querySelector<HTMLElement>(
      ".ReactModalPortal .ql-editor"
    );
    expect(editorContainer).toBeInTheDocument();

    await waitFor(async () => {
      await userEvent.type(editorContainer!, "bar1");
    });

    await waitFor(() => {
      expect(within(modal!).getByLabelText("Submit")).not.toBeDisabled();
    });

    fireEvent.click(modal!.querySelector(".append")!);

    let editorContainers: NodeListOf<HTMLElement> | null;
    await waitFor(() => {
      editorContainers = document.querySelectorAll<HTMLElement>(
        ".ReactModalPortal .ql-editor"
      );
      expect(editorContainers.length).toBe(2);
    });

    fireEvent.click(editorContainers![1]);
    await waitFor(async () => {
      await userEvent.type(editorContainers![1], "bar2");
    });

    await waitFor(() => {
      expect(within(modal!).getAllByLabelText("Submit")[1]).not.toBeDisabled();
    });

    act(() => {
      fireEvent.click(within(modal!).getAllByLabelText("Submit")[1]);
    });

    await waitForElementToBeRemoved(() =>
      document.querySelector<HTMLElement>(".ReactModalPortal .ql-editor")
    );
    await waitFor(() => {
      const mainContainer =
        document.querySelector<HTMLElement>(".content main");

      // TODO: figure out how to check that these are effectively rendered as
      // part of a chain.
      expect(within(mainContainer!).getByText("bar1")).toBeInTheDocument();
      expect(within(mainContainer!).getByText("bar2")).toBeInTheDocument();
    });
  }, 10000);

  it.todo(
    "renders comments after replying to comment (multiple comments)",
    async () => {
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

      // TODO: fill this
    },
    10000
  );
});
