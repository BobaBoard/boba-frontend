import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetInviteByNonceQueryResponse, GetInviteByNoncePathParams } from "../types/GetInviteByNonce";

/**
     * @summary Get an invite's realm and status.
     * @link /realms/:realm_id/invites/:nonce
     */
export async function getInviteByNonce (realmId: GetInviteByNoncePathParams["realm_id"], nonce: GetInviteByNoncePathParams["nonce"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetInviteByNonceQueryResponse>> {
      return client<GetInviteByNonceQueryResponse>({
          method: "get",
        url: `/realms/${realmId}/invites/${nonce}`,
        ...options
      });
};