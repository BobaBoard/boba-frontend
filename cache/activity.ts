import { InfiniteData, QueryClient } from "react-query";

import { BOARD_ACTIVITY_KEY } from "queries/board-activity";
import { FeedType } from "types/Types";
import { USER_FEED_KEY } from "queries/user-feed";

// TODO: rename this (and the rest) to "getFeedsInCache"
export const getActivitiesInCache = (
  queryClient: QueryClient,
  key: { slug: string }
): InfiniteData<FeedType>[] => {
  const boardActivityData: InfiniteData<FeedType>[] = queryClient
    .getQueryCache()
    .findAll([BOARD_ACTIVITY_KEY, { slug: key.slug }])
    .map((data) => data.state.data) as InfiniteData<FeedType>[];
  const userActivityData: InfiniteData<FeedType>[] = queryClient
    .getQueryCache()
    .findAll([USER_FEED_KEY])
    .map((data) => data.state.data) as InfiniteData<FeedType>[];

  return [...boardActivityData, ...userActivityData];
};

export const setActivitiesInCache = (
  queryClient: QueryClient,
  key: { slug: string },
  transform: (activity: FeedType) => FeedType
) => {
  const activityTransformer = (data: InfiniteData<FeedType>) => {
    const activityPages = data?.pages;
    if (!activityPages) {
      return undefined;
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
      queryKey: [BOARD_ACTIVITY_KEY, { slug: key.slug }],
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
