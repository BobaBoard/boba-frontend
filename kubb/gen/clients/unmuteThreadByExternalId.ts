import client from "../client";
import type { UnmuteThreadByExternalIdMutationResponse, UnmuteThreadByExternalIdPathParams } from "../models/UnmuteThreadByExternalId";

/**
 * @description Unmutes a specified thread.
 * @summary Unmutes a thread.
 * @link /threads/:thread_id/mute
 */
export function unmuteThreadByExternalId <TData = UnmuteThreadByExternalIdMutationResponse>(threadId: UnmuteThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "delete",
    url: `/threads/${threadId}/mute`,
    ...options
  });
};
