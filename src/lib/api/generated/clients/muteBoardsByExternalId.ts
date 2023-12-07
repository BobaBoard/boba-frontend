import client from "../client";
import type { ResponseConfig } from "../client";
import type { MuteBoardsByExternalIdMutationResponse, MuteBoardsByExternalIdPathParams } from "../types/MuteBoardsByExternalId";

/**
     * @description Mutes the specified board for the current user.
     * @summary Mutes a board.
     * @link /boards/:board_id/mute
     */
export async function muteBoardsByExternalId (boardId: MuteBoardsByExternalIdPathParams["board_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<MuteBoardsByExternalIdMutationResponse>> {
      return client<MuteBoardsByExternalIdMutationResponse>({
          method: "post",
        url: `/boards/${boardId}/mute`,
        ...options
      });
};