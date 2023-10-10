import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetBoardsFeedByExternalIdQueryResponse, GetBoardsFeedByExternalIdPathParams, GetBoardsFeedByExternalIdQueryParams } from "../models/GetBoardsFeedByExternalId";

/**
 * @summary Get the feed for the given boards' activity.
 * @link /feeds/boards/:board_id
 */
export async function getBoardsFeedByExternalId<TData = GetBoardsFeedByExternalIdQueryResponse>(boardId: GetBoardsFeedByExternalIdPathParams["board_id"], params?: GetBoardsFeedByExternalIdQueryParams, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "get",
      url: `/feeds/boards/${boardId}`,
      params,
      ...options
   });
};