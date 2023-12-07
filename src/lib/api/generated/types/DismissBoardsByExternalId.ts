import type { GenericResponse } from "./GenericResponse";

/**
 * @description Board notifications dismissed.
*/
export type DismissBoardsByExternalId204 = any | null;

export type DismissBoardsByExternalId401 = any | null;

export type DismissBoardsByExternalId404 = any | null;

export type DismissBoardsByExternalId500 = any | null;

export type DismissBoardsByExternalIdMutationResponse = any | null;

export type DismissBoardsByExternalIdPathParams = {
    /**
     * @description The external id of the board to dismiss notifications for.
     * @type string uuid
    */
    board_id: string;
};

export type DismissBoardsByExternalId403 = GenericResponse;
