import { Client, getThreadRouter } from "./utils";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "../server-mocks/data/thread";
import React from "react";
import ThreadPage from "pages/[boardId]/thread/[...threadId]";

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/hooks/useIsChangingRoute");
jest.mock("components/hooks/useOnPageExit");

describe("Post Options (Thread)", () => {
  describe("Copy link options", () => {
    it("Correctly copies thread URL from thread starter", async () => {
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
          `http://localhost/!gore/thread/${FAVORITE_CHARACTER_TO_MAIM_THREAD.id}`
        );
      });
      expect(screen.getByText("Link copied!")).toBeInTheDocument();
    });
    it("Correctly copies thread URL from thread reply", async () => {
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
          screen.queryAllByLabelText("Post options")?.[1]
        ).toBeInTheDocument();
      });
      fireEvent.click(screen.queryAllByLabelText("Post options")?.[1]);
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
          `http://localhost/!gore/thread/${FAVORITE_CHARACTER_TO_MAIM_THREAD.id}`
        );
      });
      expect(screen.getByText("Link copied!")).toBeInTheDocument();
    });

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
          // We must take the second post on the page because the first post is the thread
          // and does not have a copy post link option.
          screen.queryAllByLabelText("Post options")?.[1]
        ).toBeInTheDocument();
      });
      fireEvent.click(screen.queryAllByLabelText("Post options")?.[1]);
      await waitFor(() => {
        expect(screen.getByText("Copy link")).toBeInTheDocument();
      });
      let copiedValue = "";
      document.execCommand = jest.fn().mockImplementation(async () => {
        copiedValue = (document.activeElement as HTMLInputElement).value;
      });
      fireEvent.click(screen.getByText("Copy link"));
      await waitFor(() => {
        expect(copiedValue).toBe(
          `http://localhost/!gore/thread/${FAVORITE_CHARACTER_TO_MAIM_THREAD.id}/${FAVORITE_CHARACTER_TO_MAIM_THREAD.posts[1].id}`
        );
      });
      expect(screen.getByText("Link copied!")).toBeInTheDocument();
    });
  });
});
