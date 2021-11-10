import { getUserActivityData } from "utils/queries/feeds";
import { useAuth } from "components/Auth";
import { useInfiniteQuery } from "react-query";

export interface FeedOptions {
  showRead: boolean;
  ownOnly: boolean;
}

export const USER_FEED_KEY = "userActivityData";

export const useUserFeed = ({
  feedOptions,
  enabled,
}: {
  feedOptions: FeedOptions;
  enabled: boolean;
}) => {
  const { isLoggedIn } = useAuth();
  return useInfiniteQuery(
    [USER_FEED_KEY, feedOptions],
    ({ pageParam = undefined }) => getUserActivityData(feedOptions, pageParam),
    {
      getNextPageParam: (lastGroup) => {
        return lastGroup?.cursor.next;
      },
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      enabled: enabled && isLoggedIn,
    }
  );
};
