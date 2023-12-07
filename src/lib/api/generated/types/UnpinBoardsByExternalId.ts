import type { GenericResponse } from "./GenericResponse";

/**
 * @description The board was successfully unpinned.
*/
export type UnpinBoardsByExternalId204 = any | null;

export type UnpinBoardsByExternalId404 = any | null;

export type UnpinBoardsByExternalId500 = any | null;

export type UnpinBoardsByExternalIdMutationResponse = any | null;

export type UnpinBoardsByExternalIdPathParams = {
    /**
     * @description The name of the board to unpin.
     * @type string uuid
    */
    board_id: string;
};

export type UnpinBoardsByExternalId401 = GenericResponse;

export type UnpinBoardsByExternalId403 = GenericResponse;
