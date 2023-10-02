import client from "../client";
import type { GetCurrentUserNotificationsQueryResponse, GetCurrentUserNotificationsPathParams } from "../models/GetCurrentUserNotifications";

/**
 * @description Gets notifications data for the current user, including pinned boards.
If `realm_id` is present, also fetch notification data for the current realm.
 * @summary Gets notifications data for the current user.
 * @link /realms/:realm_id/notifications
 */
export function getCurrentUserNotifications <TData = GetCurrentUserNotificationsQueryResponse>(realmId: GetCurrentUserNotificationsPathParams["realm_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "get",
    url: `/realms/${realmId}/notifications`,
    ...options
  });
};
