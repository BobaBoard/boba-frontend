import type { GenericResponse } from "./GenericResponse";
import type { Thread } from "./Thread";

export type GetThreadByExternalIdPathParams = {
    /**
     * @description The id of the thread to fetch.
     * @type string uuid
    */
    thread_id: string;
};

export type GetThreadByExternalId401 = GenericResponse;

export type GetThreadByExternalId403 = GenericResponse;

export type GetThreadByExternalId404 = GenericResponse;

/**
 * @description The thread data.
*/
export type GetThreadByExternalIdQueryResponse = Thread;
