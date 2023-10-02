import client from "../client";
import type { UnstarThreadByExternalIdMutationResponse, UnstarThreadByExternalIdPathParams } from "../models/UnstarThreadByExternalId";

/**
 * @description Deletes selected thread from current user Star Feed.
 * @summary Removes thread from Star Feed
 * @link /threads/:thread_id/stars
 */
export function unstarThreadByExternalId <TData = UnstarThreadByExternalIdMutationResponse>(threadId: UnstarThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "delete",
    url: `/threads/${threadId}/stars`,
    ...options
  });
};
