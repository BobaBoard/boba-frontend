import client from "../client";
import type { PinBoardsByExternalIdMutationResponse, PinBoardsByExternalIdPathParams } from "../models/PinBoardsByExternalId";

/**
 * @description Pins the specified board for the current user.
 * @summary Pins a board.
 * @link /boards/:board_id/pin
 */
export function pinBoardsByExternalId <TData = PinBoardsByExternalIdMutationResponse>(boardId: PinBoardsByExternalIdPathParams["board_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "post",
    url: `/boards/${boardId}/pin`,
    ...options
  });
};
