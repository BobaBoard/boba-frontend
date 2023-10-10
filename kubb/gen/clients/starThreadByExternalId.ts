import client from "../client";
import type { ResponseConfig } from "../client";
import type { StarThreadByExternalIdMutationResponse, StarThreadByExternalIdPathParams } from "../models/StarThreadByExternalId";

/**
 * @description Adds selected thread to current user Star Feed.
 * @summary Adds thread to Star Feed
 * @link /threads/:thread_id/stars
 */
export async function starThreadByExternalId<TData = StarThreadByExternalIdMutationResponse>(threadId: StarThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "post",
      url: `/threads/${threadId}/stars`,
      ...options
   });
};