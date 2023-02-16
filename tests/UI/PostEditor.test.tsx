import { Client, getBoardRouter, getThreadRouter } from "./utils";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";

import BoardPage from "pages/[boardId]/index";
import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "../server-mocks/data/thread";
import { LOGGED_IN_V0_MEMBER_DATA } from "../server-mocks/data/realm";
import React from "react";
import { RealmType } from "types/Types";
import { TagMatcher } from "./utils/matchers";
import ThreadPage from "pages/[boardId]/thread/[...threadId]";
import { makeRealmData } from "utils/client-data";
import userEvent from "@testing-library/user-event";

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/core/useIsChangingRoute");
jest.mock("components/hooks/useOnPageExit");

const getPostByTextContent = async (textContent: string) => {
  return (await screen.findByText(textContent))?.closest("article");
};

describe("PostEditor", () => {
  it("renders post after creating new thread", async () => {
    render(
      <Client
        router={getBoardRouter({ boardSlug: "gore" })}
        initialData={{
          realm: makeRealmData(LOGGED_IN_V0_MEMBER_DATA) as RealmType,
        }}
      >
        <BoardPage />
      </Client>
    );

    fireEvent.click(screen.getByLabelText("create new thread"));
    await waitFor(() => {
      expect(screen.getByText("Random Identity")).toBeInTheDocument();
    });

    const modal = document.querySelector<HTMLElement>(".ReactModalPortal");
    const editorContainer = document.querySelector<HTMLElement>(
      ".ReactModalPortal .ql-editor"
    );
    expect(editorContainer).toBeInTheDocument();
    userEvent.type(editorContainer!, "bar");

    await waitFor(() => {
      expect(within(modal!).getByLabelText("Submit")).not.toBeDisabled();
    });

    fireEvent.click(within(modal!).getByLabelText("Submit"));

    const mainContainer = document.querySelector<HTMLElement>(".content main");
    await waitForElementToBeRemoved(
      document.querySelector<HTMLElement>(".ReactModalPortal .ql-editor")
    );
    await waitFor(() => {
      expect(within(mainContainer!).getByText("bar")).toBeInTheDocument();
    });
  });

  it("renders post after creating new thread (as role)", async () => {
    render(
      <Client
        router={getBoardRouter({ boardSlug: "gore" })}
        initialData={{
          realm: makeRealmData(LOGGED_IN_V0_MEMBER_DATA) as RealmType,
        }}
      >
        <BoardPage />
      </Client>
    );

    fireEvent.click(screen.getByLabelText("create new thread")!);
    await waitFor(() => {
      expect(screen.getByText("Random Identity")).toBeInTheDocument();
    });

    const modal = document.querySelector<HTMLElement>(".ReactModalPortal");
    const editorContainer = document.querySelector<HTMLElement>(
      ".ReactModalPortal .ql-editor"
    )!;
    // Click on the identity selection dropdown
    await within(modal!).findByLabelText("Select visible identity");
    fireEvent.click(within(modal!).getByLabelText("Select visible identity"));

    // Select the GoreMaster5000 identity
    const popover = document.querySelector<HTMLElement>(
      ".react-tiny-popover-container"
    );
    const identityInSelector = await within(popover!).findByText(
      "GoreMaster5000"
    );
    fireEvent.click(identityInSelector);

    userEvent.type(editorContainer!, "bar");

    await waitFor(() => {
      expect(within(modal!).getByLabelText("Submit")).not.toBeDisabled();
    });

    fireEvent.click(within(modal!).getByLabelText("Submit"));

    await waitForElementToBeRemoved(
      document.querySelector<HTMLElement>(".ReactModalPortal .ql-editor")
    );
    const post = await getPostByTextContent("bar");
    expect(within(post!).getByText("GoreMaster5000")).toBeVisible();
  });

  it("renders post after updating tags", async () => {
    render(
      <Client
        router={getBoardRouter({ boardSlug: "gore" })}
        initialData={{
          realm: makeRealmData(LOGGED_IN_V0_MEMBER_DATA) as RealmType,
        }}
      >
        <BoardPage />
      </Client>
    );
    const post = await getPostByTextContent(
      "Favorite murder scene in videogames?"
    );
    fireEvent.click(within(post!).getByLabelText("Post options"));
    const popover = document.querySelector<HTMLElement>(
      ".react-tiny-popover-container"
    );
    fireEvent.click(await within(popover!).findByText("Edit tags")!);

    const tagsInput = await screen.findByLabelText("The tags input area");
    const modal = document.querySelector<HTMLElement>(".ReactModalPortal");
    expect(within(modal!).getByText("bruises")).toBeVisible();

    fireEvent.click(tagsInput!);
    userEvent.type(tagsInput!, "a new tag{enter}");
    userEvent.type(tagsInput!, "+a new category{enter}");
    userEvent.type(tagsInput!, "cn: a new warning{enter}");
    userEvent.type(tagsInput!, "#a new search tag{enter}");

    fireEvent.click(within(modal!).getByLabelText("Submit"));

    await waitForElementToBeRemoved(
      document.querySelector<HTMLElement>(".ReactModalPortal .ql-editor")
    );
    const updatedPost = await getPostByTextContent(
      "Favorite murder scene in videogames?"
    );
    expect(
      screen.getByText(TagMatcher("cn:a new warning"))
    ).toBeInTheDocument();
    expect(
      within(updatedPost!).getByText(TagMatcher("»mwehehehehe"))
    ).toBeInTheDocument();
    expect(
      within(updatedPost!).getByText(TagMatcher("»a new tag"))
    ).toBeInTheDocument();
    expect(
      within(updatedPost!).getByText(TagMatcher("+blood"))
    ).toBeInTheDocument();
    expect(
      within(updatedPost!).getByText(TagMatcher("+bruises"))
    ).toBeInTheDocument();
    expect(
      within(updatedPost!).getByText(TagMatcher("+a new category"))
    ).toBeInTheDocument();
    expect(
      within(updatedPost!).getByText(TagMatcher("#a new search tag"))
    ).toBeInTheDocument();
  });

  it("renders post after replying to thread", async () => {
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
      expect(screen.getAllByText("Contribute")[0]).toBeInTheDocument();
    });
    fireEvent.click(
      document.querySelector<HTMLElement>(
        "article .footer-actions .button:first-child button"
      )!
    );

    await waitFor(() => {
      expect(screen.getByText("Post")).toBeInTheDocument();
    });

    const modal = document.querySelector<HTMLElement>(".ReactModalPortal");
    const editorContainer = document.querySelector<HTMLElement>(
      ".ReactModalPortal .ql-editor"
    );
    expect(editorContainer).toBeInTheDocument();
    userEvent.type(editorContainer!, "bar");

    await waitFor(() => {
      expect(within(modal!).getByLabelText("Submit")).not.toBeDisabled();
    });

    fireEvent.click(within(modal!).getByLabelText("Submit"));

    const mainContainer = document.querySelector<HTMLElement>(".content main");
    await waitForElementToBeRemoved(() =>
      document.querySelector<HTMLElement>(".ReactModalPortal .ql-editor")
    );
    await waitFor(() => {
      expect(within(mainContainer!).getByText("bar")).toBeInTheDocument();
    });
  });
});
