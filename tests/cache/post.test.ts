import { FeedType, PostType, SecretIdentityType } from "../../types/Types";
import { InfiniteData, QueryClient } from "react-query";
import { expect, test } from "@jest/globals";
import {
  getBoardActivityDataFromCache,
  getBoardQueryKey,
} from "./activity.test";
import { getThreadDataFromCache, getThreadKey } from "./thread.test";

import { FAVORITE_CHARACTER_GORE_EMPTY_THREAD } from "../data/Thread";
import { FAVORITE_CHARACTER_GORE_THREAD_SUMMARY } from "../data/ThreadSummary";
import { REVOLVER_OCELOT_CONTRIBUTION } from "../data/Contribution";
import { addPostInCache } from "../../cache/post";

const GORE_BOARD_FEED_SINGLE_PAGE: InfiniteData<FeedType> = {
  pageParams: [],
  pages: [
    {
      cursor: null,
      activity: [FAVORITE_CHARACTER_GORE_THREAD_SUMMARY],
    },
  ],
};

const getThreadSummaryFromBoardFeedCache = (
  queryClient: QueryClient,
  data: {
    threadId: string;
    slug: string;
  }
) => {
  const boardFeed = getBoardActivityDataFromCache(queryClient, {
    slug: data.slug,
  });

  for (const page of boardFeed.pages) {
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
      slug: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.parentBoardSlug,
      post: REVOLVER_OCELOT_CONTRIBUTION,
    });

    const threadInCache = getThreadDataFromCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
    });

    expect(threadInCache.totalPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.totalPostsAmount + 1
    );
    expect(threadInCache.directThreadsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.directThreadsAmount + 1
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
      slug: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.parentBoardSlug,
      post: newContribution,
    });

    const threadInCache = getThreadDataFromCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
    });

    expect(threadInCache.newPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.newPostsAmount + 1
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
      slug: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.parentBoardSlug,
      post: ownContribution,
    });

    const threadInCache = getThreadDataFromCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
    });

    expect(threadInCache.personalIdentity).toEqual(newSecretIdentity);
  });
});

describe("Tests for addPostInCache (feed cache)", () => {
  test("It correctly adds the post in feed cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({
        slug: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardSlug,
      }),
      GORE_BOARD_FEED_SINGLE_PAGE
    );

    addPostInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      slug: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardSlug,
      post: REVOLVER_OCELOT_CONTRIBUTION,
    });

    const threadSummary = getThreadSummaryFromBoardFeedCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      slug: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardSlug,
    });

    expect(threadSummary.totalPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.totalPostsAmount + 1
    );
    expect(threadSummary.directThreadsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.directThreadsAmount + 1
    );

    // Check that the thread object has also been updated
    expect(threadSummary).not.toBe(FAVORITE_CHARACTER_GORE_THREAD_SUMMARY);
  });

  test("It correctly deals with new posts in feed cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({
        slug: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardSlug,
      }),
      GORE_BOARD_FEED_SINGLE_PAGE
    );

    const newContribution: PostType = {
      ...REVOLVER_OCELOT_CONTRIBUTION,
      isNew: true,
    };
    addPostInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      slug: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardSlug,
      post: newContribution,
    });

    const threadSummary = getThreadSummaryFromBoardFeedCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      slug: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardSlug,
    });

    expect(threadSummary.newPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.newPostsAmount + 1
    );
  });

  test("It correctly adds personal identity in feed cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({
        slug: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardSlug,
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
      slug: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.parentBoardSlug,
      post: ownContribution,
    });

    const threadSummary = getThreadSummaryFromBoardFeedCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      slug: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardSlug,
    });

    expect(threadSummary.personalIdentity).toEqual(newSecretIdentity);
  });
});
