import { InfiniteData, QueryClient } from "react-query";
import { BoardActivityResponse } from "../types/Types";

export const getActivitiesInCache = (
  queryClient: QueryClient,
  key: { slug: string }
  // TODO: swap type with generic activity response
): InfiniteData<BoardActivityResponse>[] => {
  const boardActivityData: InfiniteData<BoardActivityResponse>[] = queryClient
    .getQueryCache()
    .findAll(["boardActivityData", { slug: key.slug }])
    .map((data) => data.state.data) as InfiniteData<BoardActivityResponse>[];
  const userActivityData: InfiniteData<BoardActivityResponse>[] = queryClient
    .getQueryCache()
    .findAll(["userActivityData"])
    .map((data) => data.state.data) as InfiniteData<BoardActivityResponse>[];

  return [...boardActivityData, ...userActivityData];
};

export const setActivitiesInCache = (
  queryClient: QueryClient,
  key: { slug: string },
  // TODO: swap type with generic activity response
  transform: (activity: BoardActivityResponse) => BoardActivityResponse
) => {
  const activityTransformer = (data: InfiniteData<BoardActivityResponse>) => {
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
      queryKey: ["boardActivityData", { slug: key.slug }],
      exact: false,
    },
    activityTransformer
  );
  queryClient.setQueriesData(
    {
      queryKey: "userActivityData",
      exact: false,
    },
    activityTransformer
  );
};
