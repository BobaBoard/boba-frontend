import client from "../client";
import type { ResponseConfig } from "../client";
import type { StarThreadByExternalIdMutationResponse, StarThreadByExternalIdPathParams } from "../types/StarThreadByExternalId";

/**
     * @description Adds selected thread to current user Star Feed.
     * @summary Adds thread to Star Feed
     * @link /threads/:thread_id/stars
     */
export async function starThreadByExternalId (threadId: StarThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<StarThreadByExternalIdMutationResponse>> {
      return client<StarThreadByExternalIdMutationResponse>({
          method: "post",
        url: `/threads/${threadId}/stars`,
        ...options
      });
};