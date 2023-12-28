import type { GenericResponse } from "./GenericResponse";

/**
 * @description The thread was succesfully muted.
*/
export type MuteThreadByExternalId204 = any | null;

export type MuteThreadByExternalIdMutationResponse = any | null;

export type MuteThreadByExternalIdPathParams = {
    /**
     * @description The id of the thread to mute.
     * @type string uuid
    */
    thread_id: string;
};

export type MuteThreadByExternalId401 = GenericResponse;

export type MuteThreadByExternalId403 = GenericResponse;

export type MuteThreadByExternalId404 = GenericResponse;
