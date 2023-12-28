import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetBoardsByExternalIdQueryResponse, GetBoardsByExternalIdPathParams } from "../types/GetBoardsByExternalId";

/**
     * @summary Fetches board metadata.
     * @link /boards/:board_id
     */
export async function getBoardsByExternalId (boardId: GetBoardsByExternalIdPathParams["board_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetBoardsByExternalIdQueryResponse>> {
      return client<GetBoardsByExternalIdQueryResponse>({
          method: "get",
        url: `/boards/${boardId}`,
        ...options
      });
};