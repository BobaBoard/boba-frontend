import client from "../client";
import type { ResponseConfig } from "../client";
import type { VisitThreadByExternalIdMutationResponse, VisitThreadByExternalIdPathParams } from "../models/VisitThreadByExternalId";

/**
 * @description Records a visit to a thread by the current user.
 * @summary Records a visit to a thread by the current user.
 * @link /threads/:thread_id/visits
 */
export async function visitThreadByExternalId<TData = VisitThreadByExternalIdMutationResponse>(threadId: VisitThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "post",
      url: `/threads/${threadId}/visits`,
      ...options
   });
};