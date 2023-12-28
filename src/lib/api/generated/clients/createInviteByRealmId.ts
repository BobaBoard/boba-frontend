import client from "../client";
import type { ResponseConfig } from "../client";
import type { CreateInviteByRealmIdMutationRequest, CreateInviteByRealmIdMutationResponse, CreateInviteByRealmIdPathParams } from "../types/CreateInviteByRealmId";

/**
     * @summary Create invite for the realm.
     * @link /realms/:realm_id/invites
     */
export async function createInviteByRealmId (realmId: CreateInviteByRealmIdPathParams["realm_id"], data?: CreateInviteByRealmIdMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<CreateInviteByRealmIdMutationResponse>> {
      return client<CreateInviteByRealmIdMutationResponse, CreateInviteByRealmIdMutationRequest>({
          method: "post",
        url: `/realms/${realmId}/invites`,
        data,
        ...options
      });
};