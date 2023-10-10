import client from "../client";
import type { ResponseConfig } from "../client";
import type { DismissBoardsByExternalIdMutationResponse, DismissBoardsByExternalIdPathParams } from "../models/DismissBoardsByExternalId";

/**
 * @summary Dismiss all notifications for board
 * @link /boards/:board_id/notifications
 */
export async function dismissBoardsByExternalId<TData = DismissBoardsByExternalIdMutationResponse>(boardId: DismissBoardsByExternalIdPathParams["board_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "delete",
      url: `/boards/${boardId}/notifications`,
      ...options
   });
};