import client from "../client";
import type { ResponseConfig } from "../client";
import type { AcceptInviteByNonceMutationRequest, AcceptInviteByNonceMutationResponse, AcceptInviteByNoncePathParams } from "../models/AcceptInviteByNonce";

/**
 * @summary Accept invite for the realm.
 * @link /realms/:realm_id/invites/:nonce
 */
export async function acceptInviteByNonce<TData = AcceptInviteByNonceMutationResponse,TVariables = AcceptInviteByNonceMutationRequest>(realmId: AcceptInviteByNoncePathParams["realm_id"], nonce: AcceptInviteByNoncePathParams["nonce"], data: TVariables, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData, TVariables>({
      method: "post",
      url: `/realms/${realmId}/invites/${nonce}`,
      data,
      ...options
   });
};