import { Client, getThreadRouter } from "./utils";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "../server-mocks/data/thread";
import React from "react";
import { TagMatcher } from "./utils/matchers";
import ThreadPage from "pages/[boardId]/thread/[...threadId]";
import { copyText } from "utils/text-utils";

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/hooks/useIsChangingRoute");
jest.mock("components/hooks/useOnPageExit");
jest.mock("utils/text-utils.ts");

const displaysOptionInPanel = async ({
  optionText,
  postId,
}: {
  optionText: string;
  postId: string;
}) => {
  const postIndex = FAVORITE_CHARACTER_TO_MAIM_THREAD.posts.findIndex(
    (post) => post.id == postId
  );
  await waitFor(async () => {
    expect(
      screen.queryAllByLabelText("Post options")?.[postIndex]
    ).toBeInTheDocument();
  });
  fireEvent.click(screen.queryAllByLabelText("Post options")?.[postIndex]);
  await waitFor(() => {
    expect(screen.getByText(optionText)).toBeInTheDocument();
  });

  return screen.getByText(optionText);
};

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

      const option = await displaysOptionInPanel({
        optionText: "Copy thread link",
        postId: FAVORITE_CHARACTER_TO_MAIM_THREAD.starter.id,
      });
      jest.mocked(copyText);
      fireEvent.click(option);
      await waitFor(() => {
        expect(screen.getByText("Link copied!")).toBeInTheDocument();
      });
      expect(copyText).toHaveBeenLastCalledWith(
        `http://localhost/!gore/thread/${FAVORITE_CHARACTER_TO_MAIM_THREAD.id}`
      );
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

      const option = await displaysOptionInPanel({
        optionText: "Copy thread link",
        postId: FAVORITE_CHARACTER_TO_MAIM_THREAD.posts[1].id,
      });
      fireEvent.click(option);
      await waitFor(() => {
        expect(screen.getByText("Link copied!")).toBeInTheDocument();
      });
      expect(copyText).toHaveBeenLastCalledWith(
        `http://localhost/!gore/thread/${FAVORITE_CHARACTER_TO_MAIM_THREAD.id}`
      );
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

      const option = await displaysOptionInPanel({
        optionText: "Copy link",
        postId: FAVORITE_CHARACTER_TO_MAIM_THREAD.posts[1].id,
      });
      fireEvent.click(option);
      await waitFor(() => {
        expect(screen.getByText("Link copied!")).toBeInTheDocument();
      });
      expect(copyText).toHaveBeenLastCalledWith(
        `http://localhost/!gore/thread/${FAVORITE_CHARACTER_TO_MAIM_THREAD.id}/${FAVORITE_CHARACTER_TO_MAIM_THREAD.posts[1].id}`
      );
    });
  });

  it("Correctly mutes and unmutes thread", async () => {
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

    const muteOption = await displaysOptionInPanel({
      optionText: "Mute thread",
      postId: FAVORITE_CHARACTER_TO_MAIM_THREAD.posts[1].id,
    });
    fireEvent.click(muteOption);
    // TODO: create a visual indicator that the thread is muted and also check that.
    const unmuteOption = await displaysOptionInPanel({
      optionText: "Unmute thread",
      postId: FAVORITE_CHARACTER_TO_MAIM_THREAD.posts[1].id,
    });
    fireEvent.click(unmuteOption);
    await displaysOptionInPanel({
      optionText: "Mute thread",
      postId: FAVORITE_CHARACTER_TO_MAIM_THREAD.posts[1].id,
    });
  });

  it("Correctly hides and unhides thread", async () => {
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

    const hideOption = await displaysOptionInPanel({
      optionText: "Hide thread",
      postId: FAVORITE_CHARACTER_TO_MAIM_THREAD.posts[1].id,
    });
    fireEvent.click(hideOption);
    // TODO: create a visual indicator that the thread is hidden and also check that.
    const unhideOption = await displaysOptionInPanel({
      optionText: "Unhide thread",
      postId: FAVORITE_CHARACTER_TO_MAIM_THREAD.posts[1].id,
    });
    fireEvent.click(unhideOption);
    await displaysOptionInPanel({
      optionText: "Hide thread",
      postId: FAVORITE_CHARACTER_TO_MAIM_THREAD.posts[1].id,
    });
  });

  it("Correctly calls tag editor", async () => {
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

    const editTagsOption = await displaysOptionInPanel({
      optionText: "Edit tags",
      postId: FAVORITE_CHARACTER_TO_MAIM_THREAD.posts[1].id,
    });
    fireEvent.click(editTagsOption);
    // TODO: create a visual indicator that the thread is hidden and also check that.
    await waitFor(
      () => {
        expect(screen.getByLabelText("The post editor footer")).toBeVisible();
      },
      { timeout: 5000 }
    );
    const postEditorFooter = screen.getByLabelText("The post editor footer");
    expect(
      within(postEditorFooter).getByText(TagMatcher("#evil"))
    ).toBeVisible();
    expect(
      within(postEditorFooter).getByText(TagMatcher("#oddly specific"))
    ).toBeVisible();
    expect(
      within(postEditorFooter).getByText(TagMatcher("#metal gear"))
    ).toBeVisible();
    expect(
      within(postEditorFooter).getByText(TagMatcher("#bobapost"))
    ).toBeVisible();

    expect(
      within(postEditorFooter).getByText(TagMatcher("»fight me on this"))
    ).toBeVisible();
  });
});
