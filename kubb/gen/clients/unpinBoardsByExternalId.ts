import client from "../client";
import type { UnpinBoardsByExternalIdMutationResponse, UnpinBoardsByExternalIdPathParams } from "../models/UnpinBoardsByExternalId";

/**
 * @description Unpins the specified board for the current user.
 * @summary Unpins a board.
 * @link /boards/:board_id/pin
 */
export function unpinBoardsByExternalId <TData = UnpinBoardsByExternalIdMutationResponse>(boardId: UnpinBoardsByExternalIdPathParams["board_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "delete",
    url: `/boards/${boardId}/pin`,
    ...options
  });
};
