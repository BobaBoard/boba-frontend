import type { GenericResponse } from "./GenericResponse";

/**
 * @description Thread removed from Star Feed successfully.
*/
export type UnstarThreadByExternalId204 = any | null;

/**
 * @description Internal Server Error
*/
export type UnstarThreadByExternalId500 = any | null;

export type UnstarThreadByExternalIdMutationResponse = any | null;

export type UnstarThreadByExternalIdPathParams = {
    /**
     * @description The id of the thread to fetch.
     * @type string
    */
    thread_id: string;
};

export type UnstarThreadByExternalId401 = GenericResponse;

export type UnstarThreadByExternalId403 = GenericResponse;

export type UnstarThreadByExternalId404 = GenericResponse;
