import { Client, getThreadRouter } from "./utils";
import {
  fireEvent,
  prettyDOM,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";

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

describe("Comments editor", () => {
  it("renders comments after replying to thread (single comment)", async () => {
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

    const mainContainer = document.querySelector<HTMLElement>(".content .main");
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
        document.querySelector<HTMLElement>(".content .main");

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
      >
        <ThreadPage />
      </Client>
    );

    // TODO: fill this
  });
});
