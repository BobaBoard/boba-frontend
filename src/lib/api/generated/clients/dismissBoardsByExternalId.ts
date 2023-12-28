import client from "../client";
import type { ResponseConfig } from "../client";
import type { DismissBoardsByExternalIdMutationResponse, DismissBoardsByExternalIdPathParams } from "../types/DismissBoardsByExternalId";

/**
     * @summary Dismiss all notifications for board
     * @link /boards/:board_id/notifications
     */
export async function dismissBoardsByExternalId (boardId: DismissBoardsByExternalIdPathParams["board_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<DismissBoardsByExternalIdMutationResponse>> {
      return client<DismissBoardsByExternalIdMutationResponse>({
          method: "delete",
        url: `/boards/${boardId}/notifications`,
        ...options
      });
};