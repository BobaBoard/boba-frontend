import {
  fireEvent,
  prettyDOM,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import BoardPage from "pages/[boardId]/index";
import { Client } from "./utils";
import React from "react";
import { rest } from "msw";
import { server } from "../server-mocks";
import userEvent from "@testing-library/user-event";

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
  it("renders a heading", async () => {
    render(
      <Client>
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
    await waitFor(() => {
      expect(editorContainer).not.toBeInTheDocument();
      expect(within(mainContainer!).getByText("bar")).toBeInTheDocument();
    });
  });
});
