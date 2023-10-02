import type { GenericResponse } from "./GenericResponse";

/**
 * @description The notifications were successfully dismissed.
*/
export type DismissUserNotifications204 = any | null;

export type DismissUserNotifications500 = any | null;

export type DismissUserNotificationsMutationResponse = any | null;

export type DismissUserNotificationsPathParams = {
    /**
     * @description The id of the realm.
     * @type string uuid
    */
    realm_id: string;
};

export type DismissUserNotifications401 = GenericResponse;

export type DismissUserNotifications403 = GenericResponse;
