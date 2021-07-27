import { useQuery, useQueryClient } from "react-query";
import debug from "debug";
import axios from "axios";
import { useAuth } from "../../Auth";
import moment from "moment";

const error = debug("bobafrontend:hooks:queries:PinnedBoards-error");
const log = debug("bobafrontend:hooks:queries:PinnedBoards-log");

interface NotificationType {
  hasNotifications: boolean;
  notificationsOutdated: boolean;
  lastUpdateFromOthersAt: Date;
}

interface NotificationsType {
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

const NO_OP_DATA = {
  hasNotifications: false,
  notificationsOutdated: false,
  pinnedBoards: {},
  realmBoards: {},
};
const NOTIFICATIONS_QUERY_KEY = "notificationsKey";
export const useNotifications = () => {
  const { isLoggedIn } = useAuth();
  const { data } = useQuery<any, undefined, NotificationsType>(
    NOTIFICATIONS_QUERY_KEY,
    async () => {
      const data = await axios.get("/users/@me/notifications");

      return data.data;
    },
    {
      refetchInterval: 30 * 1000,
      refetchOnWindowFocus: true,
      enabled: isLoggedIn,
      select: (data) => {
        return {
          hasNotifications: data.has_notifications,
          notificationsOutdated: data.is_outdated_notifications,
          pinnedBoards: parseServerNotifications(data.pinned_boards),
          realmBoards: parseServerNotifications(data.realm_boards),
        };
      },
    }
  );

  // TODO: method to invalidate
  return data || NO_OP_DATA;
};

export const useInvalidateNotifications = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries(NOTIFICATIONS_QUERY_KEY);
};
