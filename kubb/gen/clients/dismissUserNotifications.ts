import client from "../client";
import type { ResponseConfig } from "../client";
import type { DismissUserNotificationsMutationResponse, DismissUserNotificationsPathParams } from "../models/DismissUserNotifications";

/**
 * @summary Dismisses user notifications.
 * @link /realms/:realm_id/notifications
 */
export async function dismissUserNotifications<TData = DismissUserNotificationsMutationResponse>(realmId: DismissUserNotificationsPathParams["realm_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "delete",
      url: `/realms/${realmId}/notifications`,
      ...options
   });
};