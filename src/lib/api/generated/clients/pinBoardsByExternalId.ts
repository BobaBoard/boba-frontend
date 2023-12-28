import client from "../client";
import type { ResponseConfig } from "../client";
import type { PinBoardsByExternalIdMutationResponse, PinBoardsByExternalIdPathParams } from "../types/PinBoardsByExternalId";

/**
     * @description Pins the specified board for the current user.
     * @summary Pins a board.
     * @link /boards/:board_id/pin
     */
export async function pinBoardsByExternalId (boardId: PinBoardsByExternalIdPathParams["board_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<PinBoardsByExternalIdMutationResponse>> {
      return client<PinBoardsByExternalIdMutationResponse>({
          method: "post",
        url: `/boards/${boardId}/pin`,
        ...options
      });
};