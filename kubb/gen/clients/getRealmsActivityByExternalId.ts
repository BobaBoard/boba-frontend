import client from "../client";
import type { GetRealmsActivityByExternalIdQueryResponse, GetRealmsActivityByExternalIdPathParams } from "../models/GetRealmsActivityByExternalId";

/**
 * @summary Fetches latest activity summary for the realm.
 * @link /realms/:realm_id/activity
 */
export function getRealmsActivityByExternalId <TData = GetRealmsActivityByExternalIdQueryResponse>(realmId: GetRealmsActivityByExternalIdPathParams["realm_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "get",
    url: `/realms/${realmId}/activity`,
    ...options
  });
};
