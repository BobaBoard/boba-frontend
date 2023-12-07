import client from "../client";
import type { ResponseConfig } from "../client";
import type { PatchBoardsByExternalIdMutationRequest, PatchBoardsByExternalIdMutationResponse, PatchBoardsByExternalIdPathParams } from "../types/PatchBoardsByExternalId";

/**
     * @summary Update board metadata
     * @link /boards/:board_id
     */
export async function patchBoardsByExternalId (boardId: PatchBoardsByExternalIdPathParams["board_id"], data?: PatchBoardsByExternalIdMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<PatchBoardsByExternalIdMutationResponse>> {
      return client<PatchBoardsByExternalIdMutationResponse, PatchBoardsByExternalIdMutationRequest>({
          method: "patch",
        url: `/boards/${boardId}`,
        data,
        ...options
      });
};