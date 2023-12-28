import client from "../client";
import type { ResponseConfig } from "../client";
import type { UnhideThreadByExternalIdMutationResponse, UnhideThreadByExternalIdPathParams } from "../types/UnhideThreadByExternalId";

/**
     * @description Unhides the specified thread for the current user.
     * @summary Unhides a thread.
     * @link /threads/:thread_id/hide
     */
export async function unhideThreadByExternalId (threadId: UnhideThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<UnhideThreadByExternalIdMutationResponse>> {
      return client<UnhideThreadByExternalIdMutationResponse>({
          method: "delete",
        url: `/threads/${threadId}/hide`,
        ...options
      });
};