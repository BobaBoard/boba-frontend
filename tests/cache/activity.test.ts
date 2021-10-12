import {
  FAVORITE_CHARACTER_GORE,
  FAVORITE_MURDER_GORE,
  REMEMBER_TO_BE_EXCELLENT_GORE,
  STUFF_WILL_BE_INSERTED_ANIME,
} from "../data/ThreadSummary";
import { FeedType, ThreadSummaryType } from "../../types/Types";
import { InfiniteData, QueryClient } from "react-query";
import { expect, test } from "@jest/globals";
import {
  getActivitiesInCache,
  setActivitiesInCache,
} from "../../cache/activity";

import { BOARD_ACTIVITY_KEY } from "../../components/hooks/queries/board-activity";
import { USER_FEED_KEY } from "../../components/hooks/queries/user-feed";

export const getBoardQueryKey = (data: { slug: string }) => {
  return [BOARD_ACTIVITY_KEY, { slug: data.slug }];
};

export const getUserFeedKey = () => {
  return [USER_FEED_KEY];
};

export const getBoardActivityDataFromCache = (
  queryClient: QueryClient,
  data: { slug: string }
) => {
  return queryClient.getQueryState<InfiniteData<FeedType>>(
    getBoardQueryKey(data)
  ).data;
};
export const getUserFeedDataFromCache = (queryClient: QueryClient) => {
  return queryClient.getQueryState<InfiniteData<FeedType>>(getUserFeedKey())
    .data;
};

const GORE_BOARD_ACTIVITY_SINGLE_PAGE: InfiniteData<FeedType> = {
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
const USER_FEED_ACTIVITY_SINGLE_PAGE: InfiniteData<FeedType> = {
  pageParams: [],
  pages: [
    {
      cursor: null,
      activity: [STUFF_WILL_BE_INSERTED_ANIME, FAVORITE_CHARACTER_GORE],
    },
  ],
};

describe("Tests for getActivitiesInCache", () => {
  test("Activity is correctly fetched from board activity", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({ slug: "gore" }),
      GORE_BOARD_ACTIVITY_SINGLE_PAGE
    );

    const newData = getActivitiesInCache(queryClient, { slug: "gore" });

    expect(newData).toEqual([GORE_BOARD_ACTIVITY_SINGLE_PAGE]);
  });

  test("Activity is correctly fetched from board activity and personal feed", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData<InfiniteData<FeedType>>(
      getBoardQueryKey({ slug: "gore" }),
      GORE_BOARD_ACTIVITY_SINGLE_PAGE
    );
    queryClient.setQueryData(getUserFeedKey(), USER_FEED_ACTIVITY_SINGLE_PAGE);

    const newData = getActivitiesInCache(queryClient, { slug: "gore" });

    expect(newData).toEqual([
      GORE_BOARD_ACTIVITY_SINGLE_PAGE,
      USER_FEED_ACTIVITY_SINGLE_PAGE,
    ]);
  });

  test("Activity is correctly fetched from personal feed only", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(getUserFeedKey(), USER_FEED_ACTIVITY_SINGLE_PAGE);

    const newData = getActivitiesInCache(queryClient, { slug: "gore" });

    expect(newData).toEqual([USER_FEED_ACTIVITY_SINGLE_PAGE]);
  });
});

describe("Tests for setActivitiesInCache", () => {
  test("Activity is correctly set in board activity when changed", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({ slug: "gore" }),
      GORE_BOARD_ACTIVITY_SINGLE_PAGE
    );

    const newThread = {} as ThreadSummaryType;
    setActivitiesInCache(queryClient, { slug: "gore" }, (feed) => {
      const newFeed = {
        ...feed,
        activity: [...feed.activity, newThread],
      };
      return newFeed;
    });

    const newData = getBoardActivityDataFromCache(queryClient, {
      slug: "gore",
    });

    expect(newData.pages[0].activity).toContain(newThread);
    // Check that all the data chain has been updated correctly to be different objects.
    expect(newData.pages).not.toBe(GORE_BOARD_ACTIVITY_SINGLE_PAGE.pages);
    expect(newData.pages[0]).not.toBe(GORE_BOARD_ACTIVITY_SINGLE_PAGE.pages[0]);
    expect(newData.pages[0].activity).not.toBe(
      GORE_BOARD_ACTIVITY_SINGLE_PAGE.pages[0].activity
    );
  });

  test("Activity update is correctly ignored in board activity when unchanged", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({ slug: "gore" }),
      GORE_BOARD_ACTIVITY_SINGLE_PAGE
    );
    setActivitiesInCache(queryClient, { slug: "gore" }, (feed) => {
      // We return the same object, so no update should have happened
      return feed;
    });

    const newData = getBoardActivityDataFromCache(queryClient, {
      slug: "gore",
    });

    // Check that all the data chain has been updated correctly to be different objects.
    expect(newData.pages).toBe(GORE_BOARD_ACTIVITY_SINGLE_PAGE.pages);
    expect(newData.pages[0]).toBe(GORE_BOARD_ACTIVITY_SINGLE_PAGE.pages[0]);
    expect(newData.pages[0].activity).toBe(
      GORE_BOARD_ACTIVITY_SINGLE_PAGE.pages[0].activity
    );
  });

  test("Activity is correctly set in user feed when changed", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(getUserFeedKey(), USER_FEED_ACTIVITY_SINGLE_PAGE);

    const newThread = {} as ThreadSummaryType;
    setActivitiesInCache(queryClient, { slug: "gore" }, (feed) => {
      const newFeed = {
        ...feed,
        activity: [...feed.activity, newThread],
      };
      return newFeed;
    });

    const newData = getUserFeedDataFromCache(queryClient);
    expect(newData.pages[0].activity).toContain(newThread);

    // Check that all the data chain has been updated correctly to be different objects.
    expect(newData.pages).not.toBe(USER_FEED_ACTIVITY_SINGLE_PAGE.pages);
    expect(newData.pages[0]).not.toBe(USER_FEED_ACTIVITY_SINGLE_PAGE.pages[0]);
    expect(newData.pages[0].activity).not.toBe(
      USER_FEED_ACTIVITY_SINGLE_PAGE.pages[0].activity
    );
  });

  test("Activity update is correctly ignored in user feed when unchanged", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(getUserFeedKey(), USER_FEED_ACTIVITY_SINGLE_PAGE);

    setActivitiesInCache(queryClient, { slug: "gore" }, (feed) => {
      return feed;
    });

    const newData = getUserFeedDataFromCache(queryClient);

    // Check that all the data chain has been updated correctly to be different objects.
    expect(newData.pages).toBe(USER_FEED_ACTIVITY_SINGLE_PAGE.pages);
    expect(newData.pages[0]).toBe(USER_FEED_ACTIVITY_SINGLE_PAGE.pages[0]);
    expect(newData.pages[0].activity).toBe(
      USER_FEED_ACTIVITY_SINGLE_PAGE.pages[0].activity
    );
  });

  // test("Activity is correctly fetched from board activity and personal feed", () => {
  //   const queryClient = new QueryClient();

  //   queryClient.setQueryData<InfiniteData<FeedType>>(
  //     getBoardQueryKey({ slug: "gore" }),
  //     GORE_BOARD_ACTIVITY_SINGLE_PAGE
  //   );
  //   queryClient.setQueryData(getUserFeedKey(), USER_FEED_ACTIVITY_SINGLE_PAGE);
  //   const newData = getActivitiesInCache(queryClient, { slug: "gore" });

  //   expect(newData).toEqual([
  //     GORE_BOARD_ACTIVITY_SINGLE_PAGE,
  //     USER_FEED_ACTIVITY_SINGLE_PAGE,
  //   ]);
  // });

  // test("Activity is correctly fetched from personal feed only", () => {
  //   const queryClient = new QueryClient();

  //   queryClient.setQueryData(getUserFeedKey(), USER_FEED_ACTIVITY_SINGLE_PAGE);
  //   const newData = getActivitiesInCache(queryClient, { slug: "gore" });

  //   expect(newData).toEqual([USER_FEED_ACTIVITY_SINGLE_PAGE]);
  // });
});
