import type { GenericResponse } from "./GenericResponse";

/**
 * @description The board was successfully muted.
*/
export type MuteBoardsByExternalId204 = any | null;

export type MuteBoardsByExternalId404 = any | null;

export type MuteBoardsByExternalId500 = any | null;

export type MuteBoardsByExternalIdMutationResponse = any | null;

export type MuteBoardsByExternalIdPathParams = {
    /**
     * @description The external id of the board to mute.
     * @type string uuid
    */
    board_id: string;
};

export type MuteBoardsByExternalId401 = GenericResponse;

export type MuteBoardsByExternalId403 = GenericResponse;
