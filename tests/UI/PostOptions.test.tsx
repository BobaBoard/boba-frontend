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

const getPostByTextContent = async (textContent: string) => {
  return (await screen.findByText(textContent))?.closest("article");
};
export const TagMatcher = (tagText: string) => {
  return (_: string, node: HTMLElement) => {
    return node.textContent === tagText && node.classList.contains("tag");
  };
};

describe("Post Options (Thread)", () => {
  it("Correctly copies post URL", async () => {
    render(
      <Client
        router={getThreadRouter({
          threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
          boardSlug: FAVORITE_CHARACTER_TO_MAIM_THREAD.parent_board_slug,
        })}
      >
        <ThreadPage />
      </Client>
    );

    await waitFor(async () => {
      expect(
        screen.queryAllByLabelText("Post options")?.[0]
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.queryAllByLabelText("Post options")?.[0]);
    await waitFor(() => {
      expect(screen.getByText("Copy thread link")).toBeInTheDocument();
    });
    let copiedValue = "";
    document.execCommand = jest.fn().mockImplementation(async () => {
      copiedValue = (document.activeElement as HTMLInputElement).value;
    });
    fireEvent.click(screen.getByText("Copy thread link"));
    await waitFor(() => {
      expect(copiedValue).toBe(
        "http://localhost/!gore/thread/29d1b2da-3289-454a-9089-2ed47db4967b"
      );
    });

    // TODO: figure out how to test alert popup
  });
});
