import client from "../client";
import type { ResponseConfig } from "../client";
import type { UnmuteThreadByExternalIdMutationResponse, UnmuteThreadByExternalIdPathParams } from "../models/UnmuteThreadByExternalId";

/**
 * @description Unmutes a specified thread.
 * @summary Unmutes a thread.
 * @link /threads/:thread_id/mute
 */
export async function unmuteThreadByExternalId<TData = UnmuteThreadByExternalIdMutationResponse>(threadId: UnmuteThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "delete",
      url: `/threads/${threadId}/mute`,
      ...options
   });
};