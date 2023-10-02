import type { GenericResponse } from "./GenericResponse";

/**
 * @description The board was successfully unmuted.
*/
export type UnmuteBoardsByExternalId204 = any | null;

export type UnmuteBoardsByExternalId404 = any | null;

export type UnmuteBoardsByExternalId500 = any | null;

export type UnmuteBoardsByExternalIdMutationResponse = any | null;

export type UnmuteBoardsByExternalIdPathParams = {
    /**
     * @description The name of the board to unmute.
     * @type string
    */
    board_id: string;
};

export type UnmuteBoardsByExternalId401 = GenericResponse;

export type UnmuteBoardsByExternalId403 = GenericResponse;
