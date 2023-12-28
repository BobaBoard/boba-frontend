import client from "../client";
import type { ResponseConfig } from "../client";
import type { UnmuteBoardsByExternalIdMutationResponse, UnmuteBoardsByExternalIdPathParams } from "../types/UnmuteBoardsByExternalId";

/**
     * @description Unmutes the specified board for the current user.
     * @summary Unmutes a board.
     * @link /boards/:board_id/mute
     */
export async function unmuteBoardsByExternalId (boardId: UnmuteBoardsByExternalIdPathParams["board_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<UnmuteBoardsByExternalIdMutationResponse>> {
      return client<UnmuteBoardsByExternalIdMutationResponse>({
          method: "delete",
        url: `/boards/${boardId}/mute`,
        ...options
      });
};