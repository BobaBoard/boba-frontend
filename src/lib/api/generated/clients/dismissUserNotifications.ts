import client from "../client";
import type { ResponseConfig } from "../client";
import type { DismissUserNotificationsMutationResponse, DismissUserNotificationsPathParams } from "../types/DismissUserNotifications";

/**
     * @summary Dismisses user notifications.
     * @link /realms/:realm_id/notifications
     */
export async function dismissUserNotifications (realmId: DismissUserNotificationsPathParams["realm_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<DismissUserNotificationsMutationResponse>> {
      return client<DismissUserNotificationsMutationResponse>({
          method: "delete",
        url: `/realms/${realmId}/notifications`,
        ...options
      });
};