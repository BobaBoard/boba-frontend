import {
  FAVORITE_CHARACTER_GORE_THREAD_SUMMARY,
  FAVORITE_MURDER_GORE_THREAD_SUMMARY,
  REMEMBER_TO_BE_EXCELLENT_GORE_THREAD_SUMMARY,
  STUFF_WILL_BE_INSERTED_ANIME,
} from "../data/ThreadSummary";
import { FeedType, ThreadSummaryType } from "types/Types";
import { InfiniteData, QueryClient } from "react-query";
import { expect, test } from "@jest/globals";
import {
  getActivitiesInCache,
  setActivitiesInCache,
} from "lib//api/cache/activity";

import { BOARD_ACTIVITY_KEY } from "lib/api/hooks/board-feed";
import { GORE_BOARD_ID } from "../data/BoardSummary";
import { USER_FEED_KEY } from "lib/api/hooks/user-feed";

export const getBoardQueryKey = (data: { boardId: string }) => {
  return [BOARD_ACTIVITY_KEY, { boardId: data.boardId }];
};

export const getUserFeedKey = () => {
  return [USER_FEED_KEY];
};

export const getBoardActivityDataFromCache = (
  queryClient: QueryClient,
  data: { boardId: string }
) => {
  return queryClient.getQueryState<InfiniteData<FeedType>>(
    getBoardQueryKey(data)
  )?.data;
};
export const getUserFeedDataFromCache = (queryClient: QueryClient) => {
  return queryClient.getQueryState<InfiniteData<FeedType>>(getUserFeedKey())
    ?.data;
};

const GORE_BOARD_ACTIVITY_SINGLE_PAGE: InfiniteData<FeedType> = {
  pageParams: [],
  pages: [
    {
      cursor: {
        next: null,
      },
      activity: [
        REMEMBER_TO_BE_EXCELLENT_GORE_THREAD_SUMMARY,
        FAVORITE_CHARACTER_GORE_THREAD_SUMMARY,
        FAVORITE_MURDER_GORE_THREAD_SUMMARY,
      ],
    },
  ],
};
const USER_FEED_ACTIVITY_SINGLE_PAGE: InfiniteData<FeedType> = {
  pageParams: [],
  pages: [
    {
      cursor: {
        next: null,
      },
      activity: [
        STUFF_WILL_BE_INSERTED_ANIME,
        FAVORITE_CHARACTER_GORE_THREAD_SUMMARY,
      ],
    },
  ],
};

describe("Tests for getActivitiesInCache", () => {
  test("Activity is correctly fetched from board activity", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({ boardId: GORE_BOARD_ID }),
      GORE_BOARD_ACTIVITY_SINGLE_PAGE
    );

    const newData = getActivitiesInCache(queryClient, {
      boardId: GORE_BOARD_ID,
    });

    expect(newData).toEqual([GORE_BOARD_ACTIVITY_SINGLE_PAGE]);
  });

  test("Activity is correctly fetched from board activity and personal feed", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData<InfiniteData<FeedType>>(
      getBoardQueryKey({ boardId: GORE_BOARD_ID }),
      GORE_BOARD_ACTIVITY_SINGLE_PAGE
    );
    queryClient.setQueryData(getUserFeedKey(), USER_FEED_ACTIVITY_SINGLE_PAGE);

    const newData = getActivitiesInCache(queryClient, {
      boardId: GORE_BOARD_ID,
    });

    expect(newData).toEqual([
      GORE_BOARD_ACTIVITY_SINGLE_PAGE,
      USER_FEED_ACTIVITY_SINGLE_PAGE,
    ]);
  });

  test("Activity is correctly fetched from personal feed only", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(getUserFeedKey(), USER_FEED_ACTIVITY_SINGLE_PAGE);

    const newData = getActivitiesInCache(queryClient, {
      boardId: GORE_BOARD_ID,
    });

    expect(newData).toEqual([USER_FEED_ACTIVITY_SINGLE_PAGE]);
  });
});

describe("Tests for setActivitiesInCache", () => {
  test("Activity is correctly set in board activity when changed", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({ boardId: GORE_BOARD_ID }),
      GORE_BOARD_ACTIVITY_SINGLE_PAGE
    );

    const newThread = {} as ThreadSummaryType;
    setActivitiesInCache(queryClient, { boardId: GORE_BOARD_ID }, (feed) => {
      const newFeed = {
        ...feed,
        activity: [...feed.activity, newThread],
      };
      return newFeed;
    });

    const newData = getBoardActivityDataFromCache(queryClient, {
      boardId: GORE_BOARD_ID,
    });

    expect(newData?.pages[0].activity).toContain(newThread);
    // Check that all the data chain has been updated correctly to be different objects.
    expect(newData?.pages).not.toBe(GORE_BOARD_ACTIVITY_SINGLE_PAGE.pages);
    expect(newData?.pages[0]).not.toBe(
      GORE_BOARD_ACTIVITY_SINGLE_PAGE.pages[0]
    );
    expect(newData?.pages[0].activity).not.toBe(
      GORE_BOARD_ACTIVITY_SINGLE_PAGE.pages[0].activity
    );
  });

  test("Activity update is correctly ignored in board activity when unchanged", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({ boardId: GORE_BOARD_ID }),
      GORE_BOARD_ACTIVITY_SINGLE_PAGE
    );
    setActivitiesInCache(queryClient, { boardId: GORE_BOARD_ID }, (feed) => {
      // We return the same object, so no update should have happened
      return feed;
    });

    const newData = getBoardActivityDataFromCache(queryClient, {
      boardId: GORE_BOARD_ID,
    });

    // Check that all the data chain has been updated correctly to be different objects.
    expect(newData?.pages).toBe(GORE_BOARD_ACTIVITY_SINGLE_PAGE.pages);
    expect(newData?.pages[0]).toBe(GORE_BOARD_ACTIVITY_SINGLE_PAGE.pages[0]);
    expect(newData?.pages[0].activity).toBe(
      GORE_BOARD_ACTIVITY_SINGLE_PAGE.pages[0].activity
    );
  });

  test("Activity is correctly set in user feed when changed", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(getUserFeedKey(), USER_FEED_ACTIVITY_SINGLE_PAGE);

    const newThread = {} as ThreadSummaryType;
    setActivitiesInCache(queryClient, { boardId: GORE_BOARD_ID }, (feed) => {
      const newFeed = {
        ...feed,
        activity: [...feed.activity, newThread],
      };
      return newFeed;
    });

    const newData = getUserFeedDataFromCache(queryClient);
    expect(newData?.pages[0].activity).toContain(newThread);

    // Check that all the data chain has been updated correctly to be different objects.
    expect(newData?.pages).not.toBe(USER_FEED_ACTIVITY_SINGLE_PAGE.pages);
    expect(newData?.pages[0]).not.toBe(USER_FEED_ACTIVITY_SINGLE_PAGE.pages[0]);
    expect(newData?.pages[0].activity).not.toBe(
      USER_FEED_ACTIVITY_SINGLE_PAGE.pages[0].activity
    );
  });

  test("Activity update is correctly ignored in user feed when unchanged", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(getUserFeedKey(), USER_FEED_ACTIVITY_SINGLE_PAGE);

    setActivitiesInCache(queryClient, { boardId: GORE_BOARD_ID }, (feed) => {
      return feed;
    });

    const newData = getUserFeedDataFromCache(queryClient);

    // Check that all the data chain has been updated correctly to be different objects.
    expect(newData?.pages).toBe(USER_FEED_ACTIVITY_SINGLE_PAGE.pages);
    expect(newData?.pages[0]).toBe(USER_FEED_ACTIVITY_SINGLE_PAGE.pages[0]);
    expect(newData?.pages[0].activity).toBe(
      USER_FEED_ACTIVITY_SINGLE_PAGE.pages[0].activity
    );
  });

  // test("Activity is correctly fetched from board activity and personal feed", () => {
  //   const queryClient = new QueryClient();

  //   queryClient.setQueryData<InfiniteData<FeedType>>(
  //     getBoardQueryKey({ boardId: GORE_BOARD_ID }),
  //     GORE_BOARD_ACTIVITY_SINGLE_PAGE
  //   );
  //   queryClient.setQueryData(getUserFeedKey(), USER_FEED_ACTIVITY_SINGLE_PAGE);
  //   const newData = getActivitiesInCache(queryClient, { boardId: GORE_BOARD_ID });

  //   expect(newData).toEqual([
  //     GORE_BOARD_ACTIVITY_SINGLE_PAGE,
  //     USER_FEED_ACTIVITY_SINGLE_PAGE,
  //   ]);
  // });

  // test("Activity is correctly fetched from personal feed only", () => {
  //   const queryClient = new QueryClient();

  //   queryClient.setQueryData(getUserFeedKey(), USER_FEED_ACTIVITY_SINGLE_PAGE);
  //   const newData = getActivitiesInCache(queryClient, { boardId: GORE_BOARD_ID });

  //   expect(newData).toEqual([USER_FEED_ACTIVITY_SINGLE_PAGE]);
  // });
});
