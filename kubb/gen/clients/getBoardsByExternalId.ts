import client from "../client";
import type { GetBoardsByExternalIdQueryResponse, GetBoardsByExternalIdPathParams } from "../models/GetBoardsByExternalId";

/**
 * @summary Fetches board metadata.
 * @link /boards/:board_id
 */
export function getBoardsByExternalId <TData = GetBoardsByExternalIdQueryResponse>(boardId: GetBoardsByExternalIdPathParams["board_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "get",
    url: `/boards/${boardId}`,
    ...options
  });
};
