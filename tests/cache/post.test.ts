import { FeedType, PostType, SecretIdentityType } from "types/Types";
import { InfiniteData, QueryClient } from "react-query";
import { addPostInCache, setPostTagsInCache } from "lib//api/cache/post";
import { expect, test } from "@jest/globals";
import {
  getBoardActivityDataFromCache,
  getBoardQueryKey,
} from "./activity.test";
import { getThreadDataFromCache, getThreadKey } from "./thread.test";

import { FAVORITE_CHARACTER_GORE_EMPTY_THREAD } from "../data/Thread";
import { FAVORITE_CHARACTER_GORE_THREAD_SUMMARY } from "../data/ThreadSummary";
import { REVOLVER_OCELOT_CONTRIBUTION } from "../data/Contribution";

const GORE_BOARD_FEED_SINGLE_PAGE: InfiniteData<FeedType> = {
  pageParams: [],
  pages: [
    {
      cursor: { next: null },
      activity: [FAVORITE_CHARACTER_GORE_THREAD_SUMMARY],
    },
  ],
};

export const getThreadSummaryFromBoardFeedCache = (
  queryClient: QueryClient,
  data: {
    threadId: string;
    boardId: string;
  }
) => {
  const boardFeed = getBoardActivityDataFromCache(queryClient, {
    boardId: data.boardId,
  });

  for (const page of boardFeed!.pages) {
    const threadSummary = page.activity.find(
      (threadSummary) => threadSummary.id === data.threadId
    );
    if (threadSummary) {
      return threadSummary;
    }
  }
  return null;
};

describe("Tests for addPostInCache (thread cache)", () => {
  test("It correctly adds the post in thread cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getThreadKey({ threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id }),
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD
    );

    addPostInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
      boardId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.parentBoardId,
      post: REVOLVER_OCELOT_CONTRIBUTION,
    });

    const threadInCache = getThreadDataFromCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
    })!;

    expect(threadInCache.totalPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.totalPostsAmount + 1
    );
    expect(threadInCache.directThreadsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.directThreadsAmount + 1
    );
    expect(threadInCache.totalCommentsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.totalCommentsAmount
    );
    expect(threadInCache.posts).toContainEqual(REVOLVER_OCELOT_CONTRIBUTION);

    // Check that the thread object has also been updated
    expect(threadInCache).not.toBe(FAVORITE_CHARACTER_GORE_EMPTY_THREAD);
  });

  test("It correctly deals with new posts in thread cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getThreadKey({ threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id }),
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD
    );

    const newContribution: PostType = {
      ...REVOLVER_OCELOT_CONTRIBUTION,
      isNew: true,
    };
    addPostInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
      boardId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.parentBoardId,
      post: newContribution,
    });

    const threadInCache = getThreadDataFromCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
    })!;

    expect(threadInCache.newPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.newPostsAmount + 1
    );

    expect(threadInCache.newCommentsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.newCommentsAmount
    );
  });

  test("It correctly adds personal identity in thread cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getThreadKey({ threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id }),
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD
    );

    const newSecretIdentity: SecretIdentityType = {
      name: "SUPER_SECRET_IDENTITY_NAME",
      avatar: "SUPER_SECRET_IDENTITY_AVATAR",
    };
    const ownContribution: PostType = {
      ...REVOLVER_OCELOT_CONTRIBUTION,
      isOwn: true,
      secretIdentity: newSecretIdentity,
    };
    addPostInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
      boardId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.parentBoardId,
      post: ownContribution,
    });

    const threadInCache = getThreadDataFromCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
    })!;

    expect(threadInCache.personalIdentity).toEqual(newSecretIdentity);
  });
});

describe("Tests for addPostInCache (feed cache)", () => {
  test("It correctly adds the post in feed cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({
        boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      }),
      GORE_BOARD_FEED_SINGLE_PAGE
    );

    addPostInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      post: REVOLVER_OCELOT_CONTRIBUTION,
    });

    const threadSummary = getThreadSummaryFromBoardFeedCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
    })!;

    expect(threadSummary.totalPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.totalPostsAmount + 1
    );
    expect(threadSummary.directThreadsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.directThreadsAmount + 1
    );
    expect(threadSummary.totalCommentsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.totalCommentsAmount
    );

    // Check that the thread object has also been updated
    expect(threadSummary).not.toBe(FAVORITE_CHARACTER_GORE_THREAD_SUMMARY);
  });

  test("It correctly deals with new posts in feed cache (others)", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({
        boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      }),
      GORE_BOARD_FEED_SINGLE_PAGE
    );

    const newContribution: PostType = {
      ...REVOLVER_OCELOT_CONTRIBUTION,
      isNew: true,
      isOwn: false,
    };
    addPostInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      post: newContribution,
    });

    const threadSummary = getThreadSummaryFromBoardFeedCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
    })!;

    expect(threadSummary.newPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.newPostsAmount + 1
    );
    expect(threadSummary.newCommentsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.newCommentsAmount
    );
  });

  test("It correctly deals with new posts in feed cache (own)", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({
        boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      }),
      GORE_BOARD_FEED_SINGLE_PAGE
    );

    const newContribution: PostType = {
      ...REVOLVER_OCELOT_CONTRIBUTION,
      isNew: true,
      isOwn: true,
    };
    addPostInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      post: newContribution,
    });

    const threadSummary = getThreadSummaryFromBoardFeedCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
    })!;

    // Since the post has been made by the user themself, the feed should not have any new posts.
    expect(threadSummary.newPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.newPostsAmount
    );
    expect(threadSummary.newCommentsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.newCommentsAmount
    );
  });

  test("It correctly adds personal identity in feed cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({
        boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      }),
      GORE_BOARD_FEED_SINGLE_PAGE
    );
    const newSecretIdentity: SecretIdentityType = {
      name: "SUPER_SECRET_IDENTITY_NAME",
      avatar: "SUPER_SECRET_IDENTITY_AVATAR",
    };
    const ownContribution: PostType = {
      ...REVOLVER_OCELOT_CONTRIBUTION,
      isOwn: true,
      secretIdentity: newSecretIdentity,
    };
    addPostInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
      boardId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.parentBoardId,
      post: ownContribution,
    });

    const threadSummary = getThreadSummaryFromBoardFeedCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
    })!;

    expect(threadSummary.personalIdentity).toEqual(newSecretIdentity);
  });
});

describe("Tests for setPostTagsInCache (feed cache)", () => {
  test("It correctly updates the tags of the post in feed cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({
        boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      }),
      GORE_BOARD_FEED_SINGLE_PAGE
    );

    setPostTagsInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      postId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.starter.postId,
      tags: {
        whisperTags: ["whisper"],
        contentWarnings: ["spoiler"],
        categoryTags: ["gore"],
        indexTags: ["metal gear"],
      },
    });

    const threadSummary = getThreadSummaryFromBoardFeedCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
    })!;

    expect(threadSummary.starter.tags).toEqual({
      whisperTags: ["whisper"],
      contentWarnings: ["spoiler"],
      categoryTags: ["gore"],
      indexTags: ["metal gear"],
    });
    // Check that the thread object has also been updated
    expect(threadSummary.starter).not.toBe(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.starter
    );
  });

  test("It correctly updates the tags of the post in thread cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getThreadKey({ threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id }),
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD
    );

    setPostTagsInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      postId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.starter.postId,
      tags: {
        whisperTags: ["whisper"],
        contentWarnings: ["spoiler"],
        categoryTags: ["gore"],
        indexTags: ["metal gear"],
      },
    });

    const threadInCache = getThreadDataFromCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
    })!;

    expect(threadInCache.starter.tags).toEqual({
      whisperTags: ["whisper"],
      contentWarnings: ["spoiler"],
      categoryTags: ["gore"],
      indexTags: ["metal gear"],
    });
    expect(threadInCache.posts[0].tags).toEqual({
      whisperTags: ["whisper"],
      contentWarnings: ["spoiler"],
      categoryTags: ["gore"],
      indexTags: ["metal gear"],
    });
  });
});
