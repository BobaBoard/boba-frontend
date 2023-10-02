import client from "../client";
import type { PatchBoardsByExternalIdMutationRequest, PatchBoardsByExternalIdMutationResponse, PatchBoardsByExternalIdPathParams } from "../models/PatchBoardsByExternalId";

/**
 * @summary Update board metadata
 * @link /boards/:board_id
 */
export function patchBoardsByExternalId <TData = PatchBoardsByExternalIdMutationResponse, TVariables = PatchBoardsByExternalIdMutationRequest>(boardId: PatchBoardsByExternalIdPathParams["board_id"], data: TVariables, options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData, TVariables>({
    method: "patch",
    url: `/boards/${boardId}`,
    data,
    ...options
  });
};
