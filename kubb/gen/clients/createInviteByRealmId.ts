import client from "../client";
import type { CreateInviteByRealmIdMutationRequest, CreateInviteByRealmIdMutationResponse, CreateInviteByRealmIdPathParams } from "../models/CreateInviteByRealmId";

/**
 * @summary Create invite for the realm.
 * @link /realms/:realm_id/invites
 */
export function createInviteByRealmId <TData = CreateInviteByRealmIdMutationResponse, TVariables = CreateInviteByRealmIdMutationRequest>(realmId: CreateInviteByRealmIdPathParams["realm_id"], data: TVariables, options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData, TVariables>({
    method: "post",
    url: `/realms/${realmId}/invites`,
    data,
    ...options
  });
};
