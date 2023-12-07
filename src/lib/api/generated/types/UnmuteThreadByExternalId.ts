import type { GenericResponse } from "./GenericResponse";

/**
 * @description The thread was successfully unmuted.
*/
export type UnmuteThreadByExternalId204 = any | null;

export type UnmuteThreadByExternalIdMutationResponse = any | null;

export type UnmuteThreadByExternalIdPathParams = {
    /**
     * @description The id of the thread to unmute.
     * @type string uuid
    */
    thread_id: string;
};

export type UnmuteThreadByExternalId401 = GenericResponse;

export type UnmuteThreadByExternalId403 = GenericResponse;

export type UnmuteThreadByExternalId404 = GenericResponse;
