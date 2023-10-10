import client from "../client";
import type { ResponseConfig } from "../client";
import type { UnmuteBoardsByExternalIdMutationResponse, UnmuteBoardsByExternalIdPathParams } from "../models/UnmuteBoardsByExternalId";

/**
 * @description Unmutes the specified board for the current user.
 * @summary Unmutes a board.
 * @link /boards/:board_id/mute
 */
export async function unmuteBoardsByExternalId<TData = UnmuteBoardsByExternalIdMutationResponse>(boardId: UnmuteBoardsByExternalIdPathParams["board_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "delete",
      url: `/boards/${boardId}/mute`,
      ...options
   });
};