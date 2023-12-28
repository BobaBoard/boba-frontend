import type { GenericResponse } from "./GenericResponse";

/**
 * @description The board was successfully pinned.
*/
export type PinBoardsByExternalId204 = any | null;

export type PinBoardsByExternalId404 = any | null;

export type PinBoardsByExternalId500 = any | null;

export type PinBoardsByExternalIdMutationResponse = any | null;

export type PinBoardsByExternalIdPathParams = {
    /**
     * @description The name of the board to pin.
     * @type string
    */
    board_id: string;
};

export type PinBoardsByExternalId401 = GenericResponse;

export type PinBoardsByExternalId403 = GenericResponse;
