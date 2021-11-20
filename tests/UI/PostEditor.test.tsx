import { Client, getBoardRouter, getThreadRouter } from "./utils";
import {
  fireEvent,
  prettyDOM,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";

import BoardPage from "pages/[boardId]/index";
import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "../server-mocks/data/thread";
import React from "react";
import ThreadPage from "pages/[boardId]/thread/[...threadId]";
import userEvent from "@testing-library/user-event";

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/hooks/useIsChangingRoute");
jest.mock("components/hooks/useOnPageExit");

beforeAll(() => {
  document.createRange = () => {
    const range = new Range();

    range.getBoundingClientRect = () => {
      return {
        x: 0,
        y: 0,
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        toJSON: jest.fn(),
      };
    };

    range.getClientRects = () => {
      return {
        item: () => null,
        length: 0,
        [Symbol.iterator]: jest.fn(),
      };
    };

    return range;
  };
});

describe("PostEditor", () => {
  it("renders post after creating new thread", async () => {
    render(
      <Client router={getBoardRouter({ boardSlug: "gore" })}>
        <BoardPage />
      </Client>
    );

    fireEvent.click(document.querySelector(".fab-clickable-area")!);
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

    const mainContainer = document.querySelector<HTMLElement>(".content .main");
    await waitForElementToBeRemoved(() =>
      document.querySelector<HTMLElement>(".ReactModalPortal .ql-editor")
    );
    await waitFor(() => {
      expect(within(mainContainer!).getByText("bar")).toBeInTheDocument();
    });
  });

  it("renders post after replying to thread", async () => {
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

    await waitFor(() => {
      expect(screen.getAllByText("Contribute")[0]).toBeInTheDocument();
    });
    fireEvent.click(
      document.querySelector<HTMLElement>(
        ".post-container .footer-actions .button:first-child button"
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

    const mainContainer = document.querySelector<HTMLElement>(".content .main");
    await waitForElementToBeRemoved(() =>
      document.querySelector<HTMLElement>(".ReactModalPortal .ql-editor")
    );
    await waitFor(() => {
      expect(within(mainContainer!).getByText("bar")).toBeInTheDocument();
    });
  });
});
