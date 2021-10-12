import {
  FAVORITE_CHARACTER_GORE,
  FAVORITE_MURDER_GORE,
  REMEMBER_TO_BE_EXCELLENT_GORE,
  STUFF_WILL_BE_INSERTED_ANIME,
} from "../data/ThreadSummary";
import { FeedType, ThreadSummaryType, ThreadType } from "../../types/Types";
import { InfiniteData, QueryClient } from "react-query";
import { expect, test } from "@jest/globals";
import {
  getBoardActivityDataFromCache,
  getBoardQueryKey,
  getUserFeedDataFromCache,
  getUserFeedKey,
} from "./activity.test";

import { REMEMBER_TO_BE_EXCELLENT_GORE_THREAD } from "../data/Thread";
import { THREAD_QUERY_KEY } from "../../components/hooks/queries/thread";
import { setThreadInCache } from "../../cache/thread";

const GORE_BOARD_FEED_SINGLE_PAGE: InfiniteData<FeedType> = {
  pageParams: [],
  pages: [
    {
      cursor: null,
      activity: [
        REMEMBER_TO_BE_EXCELLENT_GORE,
        FAVORITE_CHARACTER_GORE,
        FAVORITE_MURDER_GORE,
      ],
    },
  ],
};
const USER_FEED_SINGLE_PAGE: InfiniteData<FeedType> = {
  pageParams: [],
  pages: [
    {
      cursor: null,
      activity: [STUFF_WILL_BE_INSERTED_ANIME, FAVORITE_CHARACTER_GORE],
    },
  ],
};

const getThreadKey = (data: { threadId: string }) => {
  return [THREAD_QUERY_KEY, data];
};

export const getThreadDataFromCache = (
  queryClient: QueryClient,
  data: { threadId: string }
) => {
  return queryClient.getQueryState<ThreadType>(getThreadKey(data)).data;
};

describe("Tests for setThreadInCache", () => {
  test("Thread is correctly updated in board feed", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({ slug: "gore" }),
      GORE_BOARD_FEED_SINGLE_PAGE
    );

    const newThreadSummary = {
      id: "fake_thread_id",
    } as ThreadSummaryType;
    setThreadInCache(
      queryClient,
      {
        slug: REMEMBER_TO_BE_EXCELLENT_GORE.parentBoardSlug,
        threadId: REMEMBER_TO_BE_EXCELLENT_GORE.id,
      },
      {
        transformThread: (thread) => thread,
        transformThreadSummary: () => newThreadSummary,
      }
    );

    const newData = getBoardActivityDataFromCache(queryClient, {
      slug: "gore",
    });
    // TODO: why is it not the same instance of the object?
    expect(newData.pages[0].activity).toContainEqual(newThreadSummary);
    expect(newData.pages[0].activity).not.toContain(
      REMEMBER_TO_BE_EXCELLENT_GORE
    );
    // Check that all the data chain has been updated correctly to be different objects.
    expect(newData.pages).not.toBe(GORE_BOARD_FEED_SINGLE_PAGE.pages);
    expect(newData.pages[0]).not.toBe(GORE_BOARD_FEED_SINGLE_PAGE.pages[0]);
    expect(newData.pages[0].activity).not.toBe(
      GORE_BOARD_FEED_SINGLE_PAGE.pages[0].activity
    );
  });

  test("Thread is correctly updated in user feed", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(getUserFeedKey(), USER_FEED_SINGLE_PAGE);

    const newThreadSummary = {
      id: "fake_thread_id",
    } as ThreadSummaryType;
    setThreadInCache(
      queryClient,
      {
        slug: STUFF_WILL_BE_INSERTED_ANIME.parentBoardSlug,
        threadId: STUFF_WILL_BE_INSERTED_ANIME.id,
      },
      {
        transformThread: (thread) => thread,
        transformThreadSummary: () => newThreadSummary,
      }
    );

    const newData = getUserFeedDataFromCache(queryClient);
    // TODO: why is it not the same instance of the object?
    expect(newData.pages[0].activity).toContainEqual(newThreadSummary);
    expect(newData.pages[0].activity).not.toContain(
      STUFF_WILL_BE_INSERTED_ANIME
    );

    // Check that all the data chain has been updated correctly to be different objects.
    expect(newData.pages).not.toBe(USER_FEED_SINGLE_PAGE.pages);
    expect(newData.pages[0]).not.toBe(USER_FEED_SINGLE_PAGE.pages[0]);
    expect(newData.pages[0].activity).not.toBe(
      USER_FEED_SINGLE_PAGE.pages[0].activity
    );
  });

  test("Thread is correctly updated in thread cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getThreadKey({ threadId: REMEMBER_TO_BE_EXCELLENT_GORE_THREAD.id }),
      REMEMBER_TO_BE_EXCELLENT_GORE_THREAD
    );
    const newThread = {
      id: "fake_thread_id",
    } as ThreadType;
    setThreadInCache(
      queryClient,
      {
        slug: REMEMBER_TO_BE_EXCELLENT_GORE_THREAD.parentBoardSlug,
        threadId: REMEMBER_TO_BE_EXCELLENT_GORE_THREAD.id,
      },
      {
        transformThread: () => newThread,
        transformThreadSummary: (threadSummary) => threadSummary,
      }
    );
    const newData = getThreadDataFromCache(queryClient, {
      threadId: REMEMBER_TO_BE_EXCELLENT_GORE_THREAD.id,
    });
    // TODO: why is it not the same instance of the object?
    expect(newData).toEqual(newThread);
    expect(newData).not.toEqual(STUFF_WILL_BE_INSERTED_ANIME);
  });
});
