import client from "../client";
import type { ResponseConfig } from "../client";
import type { HideThreadByExternalIdMutationResponse, HideThreadByExternalIdPathParams } from "../types/HideThreadByExternalId";

/**
     * @description Hides the specified thread for the current user.
     * @summary Hides a thread.
     * @link /threads/:thread_id/hide
     */
export async function hideThreadByExternalId (threadId: HideThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<HideThreadByExternalIdMutationResponse>> {
      return client<HideThreadByExternalIdMutationResponse>({
          method: "post",
        url: `/threads/${threadId}/hide`,
        ...options
      });
};