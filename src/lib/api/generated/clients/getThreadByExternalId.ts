import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetThreadByExternalIdQueryResponse, GetThreadByExternalIdPathParams } from "../types/GetThreadByExternalId";

/**
     * @description Fetches data for the specified thread.
     * @summary Fetches thread data.
     * @link /threads/:thread_id
     */
export async function getThreadByExternalId (threadId: GetThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetThreadByExternalIdQueryResponse>> {
      return client<GetThreadByExternalIdQueryResponse>({
          method: "get",
        url: `/threads/${threadId}`,
        ...options
      });
};