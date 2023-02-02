import { getUserActivityData } from "utils/queries/feeds";
import { useAuth } from "components/Auth";
import { useInfiniteQuery } from "react-query";
import { useRealmContext } from "contexts/RealmContext";

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
  const { id: realmId } = useRealmContext();
  return useInfiniteQuery(
    [USER_FEED_KEY, feedOptions],
    ({ pageParam = undefined }) =>
      getUserActivityData(
        {
          ...feedOptions,
          realmId,
        },
        pageParam
      ),
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
