import { useQuery, useQueryClient } from "react-query";

import { UserNotifications } from "types/Types";
import axios from "axios";
import { makeClientNotifications } from "utils/client-data";
import { useAuth } from "components/Auth";

// import debug from "debug";
// const error = debug("bobafrontend:hooks:queries:notifications-error");
// const log = debug("bobafrontend:hooks:queries:notifications-log");

const NOTIFICATIONS_QUERY_KEY = "notificationsKey";
export const useNotifications = () => {
  const { isLoggedIn } = useAuth();
  const { data, isFetched } = useQuery<UserNotifications | null>(
    NOTIFICATIONS_QUERY_KEY,
    async () => {
      const data = (await axios.get("/users/@me/notifications")).data;
      if (!data) {
        return null;
      }
      return makeClientNotifications(data);
    },
    {
      refetchInterval: 30 * 1000,
      refetchOnWindowFocus: true,
      enabled: isLoggedIn,
    }
  );

  return {
    pinnedBoardsNotifications: data?.pinnedBoards || {},
    realmBoardsNotifications: data?.realmBoards || {},
    hasNotifications: !!data?.hasNotifications,
    notificationsOutdated: !!data?.isOutdatedNotifications,
    notificationsFetched: isFetched,
  };
};

export const useInvalidateNotifications = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries(NOTIFICATIONS_QUERY_KEY);
};
