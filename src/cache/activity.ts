import { InfiniteData, QueryClient } from "react-query";

import { BOARD_ACTIVITY_KEY } from "queries/board-feed";
import { FeedType } from "types/Types";
import { USER_FEED_KEY } from "queries/user-feed";

// TODO: rename this (and the rest) to "getFeedsInCache"
export const getActivitiesInCache = (
  queryClient: QueryClient,
  key: { boardId: string }
): InfiniteData<FeedType>[] => {
  const boardActivityData: InfiniteData<FeedType>[] = queryClient
    .getQueryCache()
    .findAll([BOARD_ACTIVITY_KEY, { boardId: key.boardId }])
    .map((data) => data.state.data) as InfiniteData<FeedType>[];
  const userActivityData: InfiniteData<FeedType>[] = queryClient
    .getQueryCache()
    .findAll([USER_FEED_KEY])
    .map((data) => data.state.data) as InfiniteData<FeedType>[];

  return [...boardActivityData, ...userActivityData];
};

export const setActivitiesInCache = (
  queryClient: QueryClient,
  key: { boardId: string },
  transform: (activity: FeedType) => FeedType
) => {
  const activityTransformer = (data: InfiniteData<FeedType> | undefined) => {
    const activityPages = data?.pages;
    if (!activityPages) {
      return {
        pages: [],
        pageParams: [],
      };
    }
    let updated = false;
    const updatedPages = [...activityPages];
    for (let i = 0; i < activityPages?.length; i++) {
      const updatedPage = transform(activityPages[i]);
      if (updatedPage !== activityPages[i]) {
        updated = true;
        updatedPages[i] = updatedPage;
      }
    }

    return updated
      ? {
          ...data,
          pages: updatedPages,
        }
      : data;
  };
  queryClient.setQueriesData(
    {
      queryKey: [BOARD_ACTIVITY_KEY, { boardId: key.boardId }],
      exact: false,
    },
    activityTransformer
  );
  queryClient.setQueriesData(
    {
      queryKey: USER_FEED_KEY,
      exact: false,
    },
    activityTransformer
  );
};
