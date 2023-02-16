import { Client, getThreadRouter } from "./utils";
import {
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
import { makeRealmData } from "utils/client-data";
import userEvent from "@testing-library/user-event";

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/core/useIsChangingRoute");
jest.mock("components/hooks/useOnPageExit");

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
    userEvent.type(editorContainer!, "bar1");

    await waitFor(() => {
      expect(within(modal!).getByLabelText("Submit")).not.toBeDisabled();
    });

    fireEvent.click(within(modal!).getByLabelText("Submit"));

    await waitForElementToBeRemoved(() =>
      document.querySelector<HTMLElement>(".ReactModalPortal .ql-editor")
    );

    const mainContainer = document.querySelector<HTMLElement>(".content main");
    await waitFor(() => {
      expect(within(mainContainer!).getByText("bar1")).toBeInTheDocument();
    });
  });

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
    fireEvent.click(screen.getAllByText("Comment")[0]);

    await waitFor(() => {
      expect(screen.getByLabelText("Submit")).toBeVisible();
    });

    const modal = document.querySelector<HTMLElement>(".ReactModalPortal");
    const editorContainer = document.querySelector<HTMLElement>(
      ".ReactModalPortal .ql-editor"
    );
    expect(editorContainer).toBeInTheDocument();
    userEvent.type(editorContainer!, "bar1");

    await waitFor(() => {
      expect(within(modal!).getByLabelText("Submit")).not.toBeDisabled();
    });

    fireEvent.click(modal!.querySelector(".append")!);

    await waitFor(() => {
      const editorContainer = document.querySelectorAll<HTMLElement>(
        ".ReactModalPortal .ql-editor"
      );
      expect(editorContainer.length).toBe(2);
      userEvent.type(editorContainer![1], "bar2");
    });

    await waitFor(() => {
      expect(within(modal!).getAllByLabelText("Submit")[1]).not.toBeDisabled();
    });

    fireEvent.click(within(modal!).getAllByLabelText("Submit")[1]);

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
  });

  it("renders comments after replying to comment (multiple comments)", async () => {
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
  });
});
