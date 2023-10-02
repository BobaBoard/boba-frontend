import client from "../client";
import type { GetInviteByNonceQueryResponse, GetInviteByNoncePathParams } from "../models/GetInviteByNonce";

/**
 * @summary Get an invite's realm and status.
 * @link /realms/:realm_id/invites/:nonce
 */
export function getInviteByNonce <TData = GetInviteByNonceQueryResponse>(realmId: GetInviteByNoncePathParams["realm_id"], nonce: GetInviteByNoncePathParams["nonce"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "get",
    url: `/realms/${realmId}/invites/${nonce}`,
    ...options
  });
};
