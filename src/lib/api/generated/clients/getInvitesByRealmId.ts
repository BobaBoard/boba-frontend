import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetInvitesByRealmIdQueryResponse, GetInvitesByRealmIdPathParams } from "../types/GetInvitesByRealmId";

/**
     * @description See https://github.com/essential-randomness/bobaserver/issues/56 for future design intentions to return all invites.
     * @summary List all pending invites for the realm
     * @link /realms/:realm_id/invites
     */
export async function getInvitesByRealmId (realmId: GetInvitesByRealmIdPathParams["realm_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetInvitesByRealmIdQueryResponse>> {
      return client<GetInvitesByRealmIdQueryResponse>({
          method: "get",
        url: `/realms/${realmId}/invites`,
        ...options
      });
};