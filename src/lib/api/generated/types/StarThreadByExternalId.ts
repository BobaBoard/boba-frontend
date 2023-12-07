import type { GenericResponse } from "./GenericResponse";

/**
 * @description Thread added to Star Feed successfully.
*/
export type StarThreadByExternalId204 = any | null;

/**
 * @description Internal Server Error
*/
export type StarThreadByExternalId500 = any | null;

export type StarThreadByExternalIdMutationResponse = any | null;

export type StarThreadByExternalIdPathParams = {
    /**
     * @description The id of the thread to star.
     * @type string uuid
    */
    thread_id: string;
};

export type StarThreadByExternalId401 = GenericResponse;

export type StarThreadByExternalId403 = GenericResponse;

export type StarThreadByExternalId404 = GenericResponse;
