import client from "../client";
import type { ResponseConfig } from "../client";
import type { UnstarThreadByExternalIdMutationResponse, UnstarThreadByExternalIdPathParams } from "../types/UnstarThreadByExternalId";

/**
     * @description Deletes selected thread from current user Star Feed.
     * @summary Removes thread from Star Feed
     * @link /threads/:thread_id/stars
     */
export async function unstarThreadByExternalId (threadId: UnstarThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<UnstarThreadByExternalIdMutationResponse>> {
      return client<UnstarThreadByExternalIdMutationResponse>({
          method: "delete",
        url: `/threads/${threadId}/stars`,
        ...options
      });
};