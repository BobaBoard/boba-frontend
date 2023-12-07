import client from "../client";
import type { ResponseConfig } from "../client";
import type { VisitBoardsByExternalIdQueryResponse, VisitBoardsByExternalIdPathParams } from "../types/VisitBoardsByExternalId";

/**
     * @summary Sets last visited time for board
     * @link /boards/:board_id/visits
     */
export async function visitBoardsByExternalId (boardId: VisitBoardsByExternalIdPathParams["board_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<VisitBoardsByExternalIdQueryResponse>> {
      return client<VisitBoardsByExternalIdQueryResponse>({
          method: "get",
        url: `/boards/${boardId}/visits`,
        ...options
      });
};