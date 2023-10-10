import client from "../client";
import type { ResponseConfig } from "../client";
import type { MuteBoardsByExternalIdMutationResponse, MuteBoardsByExternalIdPathParams } from "../models/MuteBoardsByExternalId";

/**
 * @description Mutes the specified board for the current user.
 * @summary Mutes a board.
 * @link /boards/:board_id/mute
 */
export async function muteBoardsByExternalId<TData = MuteBoardsByExternalIdMutationResponse>(boardId: MuteBoardsByExternalIdPathParams["board_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "post",
      url: `/boards/${boardId}/mute`,
      ...options
   });
};