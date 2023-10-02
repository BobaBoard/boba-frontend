import client from "../client";
import type { UpdateThreadExternalIdMutationRequest, UpdateThreadExternalIdMutationResponse, UpdateThreadExternalIdPathParams } from "../models/UpdateThreadExternalId";

/**
 * @description Updates the default view that the thread uses or the parent board of the thread.
 * @summary Update thread properties.
 * @link /threads/:thread_id
 */
export function updateThreadExternalId <TData = UpdateThreadExternalIdMutationResponse, TVariables = UpdateThreadExternalIdMutationRequest>(threadId: UpdateThreadExternalIdPathParams["thread_id"], data: TVariables, options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData, TVariables>({
    method: "patch",
    url: `/threads/${threadId}`,
    data,
    ...options
  });
};
