import client from "../client";
import type { ResponseConfig } from "../client";
import type { VisitThreadByExternalIdMutationResponse, VisitThreadByExternalIdPathParams } from "../types/VisitThreadByExternalId";

/**
     * @description Records a visit to a thread by the current user.
     * @summary Records a visit to a thread by the current user.
     * @link /threads/:thread_id/visits
     */
export async function visitThreadByExternalId (threadId: VisitThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<VisitThreadByExternalIdMutationResponse>> {
      return client<VisitThreadByExternalIdMutationResponse>({
          method: "post",
        url: `/threads/${threadId}/visits`,
        ...options
      });
};