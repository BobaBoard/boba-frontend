import { useQuery, useQueryClient } from "react-query";

import axios from "axios";
import moment from "moment";
import { useAuth } from "../../Auth";

// import debug from "debug";
// const error = debug("bobafrontend:hooks:queries:notifications-error");
// const log = debug("bobafrontend:hooks:queries:notifications-log");

interface NotificationType {
  hasNotifications: boolean;
  notificationsOutdated: boolean;
  lastUpdateFromOthersAt: Date | null;
}

export interface NotificationsType {
  hasNotifications: boolean;
  notificationsOutdated: boolean;
  pinnedBoards: Record<string, NotificationType>;
  realmBoards: Record<string, NotificationType>;
}

const parseServerNotifications = (notifications: Record<string, any>) => {
  return Object.values(notifications).reduce<Record<string, NotificationType>>(
    (agg, curr) => {
      agg[curr.id] = {
        hasNotifications: curr.has_updates,
        notificationsOutdated: curr.is_outdated,
        lastUpdateFromOthersAt: moment
          .utc(curr.last_activity_from_others_at)
          .toDate(),
      };
      return agg;
    },
    {}
  );
};

const NOTIFICATIONS_QUERY_KEY = "notificationsKey";
export const useNotifications = () => {
  const { isLoggedIn } = useAuth();
  const { data, isFetched } = useQuery<NotificationsType | null>(
    NOTIFICATIONS_QUERY_KEY,
    async () => {
      const data = (await axios.get("/users/@me/notifications")).data;
      if (!data) {
        return null;
      }
      return {
        hasNotifications: data.has_notifications,
        notificationsOutdated: data.is_outdated_notifications,
        pinnedBoards: parseServerNotifications(data.pinned_boards),
        realmBoards: parseServerNotifications(data.realm_boards),
      };
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
    notificationsOutdated: !!data?.notificationsOutdated,
    notificationsFetched: isFetched,
  };
};

export const useInvalidateNotifications = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries(NOTIFICATIONS_QUERY_KEY);
};
