import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetThreadByExternalIdQueryResponse, GetThreadByExternalIdPathParams } from "../models/GetThreadByExternalId";

/**
 * @description Fetches data for the specified thread.
 * @summary Fetches thread data.
 * @link /threads/:thread_id
 */
export async function getThreadByExternalId<TData = GetThreadByExternalIdQueryResponse>(threadId: GetThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "get",
      url: `/threads/${threadId}`,
      ...options
   });
};