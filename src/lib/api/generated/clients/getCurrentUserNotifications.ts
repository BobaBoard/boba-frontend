import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetCurrentUserNotificationsQueryResponse, GetCurrentUserNotificationsPathParams } from "../types/GetCurrentUserNotifications";

/**
     * @description Gets notifications data for the current user, including pinned boards.
    If `realm_id` is present, also fetch notification data for the current realm.
    
     * @summary Gets notifications data for the current user.
     * @link /realms/:realm_id/notifications
     */
export async function getCurrentUserNotifications (realmId: GetCurrentUserNotificationsPathParams["realm_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetCurrentUserNotificationsQueryResponse>> {
      return client<GetCurrentUserNotificationsQueryResponse>({
          method: "get",
        url: `/realms/${realmId}/notifications`,
        ...options
      });
};