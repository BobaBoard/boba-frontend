import type {
  GetBoardsFeedByExternalIdPathParams,
  GetBoardsFeedByExternalIdQueryParams,
  GetBoardsFeedByExternalIdQueryResponse,
} from "../models/GetBoardsFeedByExternalId";

import client from "../client";

/**
 * @summary Get the feed for the given boards' activity.
 * @link /feeds/boards/:board_id
 */
export function getBoardsFeedByExternalId<
  TData = GetBoardsFeedByExternalIdQueryResponse
>(
  boardId: GetBoardsFeedByExternalIdPathParams["board_id"],
  params?: GetBoardsFeedByExternalIdQueryParams,
  options: Partial<Parameters<typeof client>[0]> = {}
) {
  return client<TData>({
    method: "get",
    url: `/feeds/boards/${boardId}`,
    params,
    ...options,
  });
}
