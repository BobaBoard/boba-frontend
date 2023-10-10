import client from "../client";
import type { ResponseConfig } from "../client";
import type { HideThreadByExternalIdMutationResponse, HideThreadByExternalIdPathParams } from "../models/HideThreadByExternalId";

/**
 * @description Hides the specified thread for the current user.
 * @summary Hides a thread.
 * @link /threads/:thread_id/hide
 */
export async function hideThreadByExternalId<TData = HideThreadByExternalIdMutationResponse>(threadId: HideThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "post",
      url: `/threads/${threadId}/hide`,
      ...options
   });
};