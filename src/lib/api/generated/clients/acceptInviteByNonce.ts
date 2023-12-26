import client from "../client";
import type { ResponseConfig } from "../client";
import type { AcceptInviteByNonceMutationRequest, AcceptInviteByNonceMutationResponse, AcceptInviteByNoncePathParams } from "../types/AcceptInviteByNonce";

/**
     * @summary Accept invite for the realm.
     * @link /realms/:realm_id/invites/:nonce
     */
export async function acceptInviteByNonce (realmId: AcceptInviteByNoncePathParams["realm_id"], nonce: AcceptInviteByNoncePathParams["nonce"], data: AcceptInviteByNonceMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<AcceptInviteByNonceMutationResponse>> {
      return client<AcceptInviteByNonceMutationResponse, AcceptInviteByNonceMutationRequest>({
          method: "post",
        url: `/realms/${realmId}/invites/${nonce}`,
        data,
        ...options
      });
};