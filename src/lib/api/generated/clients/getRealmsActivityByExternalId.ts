import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetRealmsActivityByExternalIdQueryResponse, GetRealmsActivityByExternalIdPathParams } from "../types/GetRealmsActivityByExternalId";

/**
     * @summary Fetches latest activity summary for the realm.
     * @link /realms/:realm_id/activity
     */
export async function getRealmsActivityByExternalId (realmId: GetRealmsActivityByExternalIdPathParams["realm_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetRealmsActivityByExternalIdQueryResponse>> {
      return client<GetRealmsActivityByExternalIdQueryResponse>({
          method: "get",
        url: `/realms/${realmId}/activity`,
        ...options
      });
};