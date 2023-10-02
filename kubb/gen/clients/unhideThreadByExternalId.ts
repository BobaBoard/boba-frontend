import client from "../client";
import type { UnhideThreadByExternalIdMutationResponse, UnhideThreadByExternalIdPathParams } from "../models/UnhideThreadByExternalId";

/**
 * @description Unhides the specified thread for the current user.
 * @summary Unhides a thread.
 * @link /threads/:thread_id/hide
 */
export function unhideThreadByExternalId <TData = UnhideThreadByExternalIdMutationResponse>(threadId: UnhideThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "delete",
    url: `/threads/${threadId}/hide`,
    ...options
  });
};
