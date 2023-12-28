import client from "../client";
import type { ResponseConfig } from "../client";
import type { UpdateThreadExternalIdMutationRequest, UpdateThreadExternalIdMutationResponse, UpdateThreadExternalIdPathParams } from "../types/UpdateThreadExternalId";

/**
     * @description Updates the default view that the thread uses or the parent board of the thread.
     * @summary Update thread properties.
     * @link /threads/:thread_id
     */
export async function updateThreadExternalId (threadId: UpdateThreadExternalIdPathParams["thread_id"], data?: UpdateThreadExternalIdMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<UpdateThreadExternalIdMutationResponse>> {
      return client<UpdateThreadExternalIdMutationResponse, UpdateThreadExternalIdMutationRequest>({
          method: "patch",
        url: `/threads/${threadId}`,
        data,
        ...options
      });
};