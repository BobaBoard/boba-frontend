
export const createThreadDefaultView = {
    "thread": "thread",
    "gallery": "gallery",
    "timeline": "timeline"
} as const;
export type CreateThreadDefaultView = (typeof createThreadDefaultView)[keyof typeof createThreadDefaultView];
export type CreateThread = {
    /**
     * @description The content of the first post in the thread.
     * @type string quill-delta
    */
    content: string;
    /**
     * @description Force anonymity even among friends.
     * @deprecated
    */
    forceAnonymous?: (boolean | null) | undefined;
    /**
     * @description The default view that the thread will display as.
     * @type string | undefined
    */
    defaultView?: CreateThreadDefaultView | undefined;
    /**
     * @description The identity the original poster will use to create the thread.
     * @type string | undefined uuid
    */
    identityId?: string | undefined;
    /**
     * @description The accessory that the original poster will use in the thread.
     * @type string | undefined uuid
    */
    accessoryId?: string | undefined;
    /**
     * @description The whisper tags associated with the thread.
     * @type array | undefined
    */
    whisper_tags?: string[] | undefined;
    /**
     * @description The searchable tags associated with the thread.
     * @type array | undefined
    */
    index_tags?: string[] | undefined;
    /**
     * @description The content warnings associated with the thread.
     * @type array | undefined
    */
    content_warnings?: string[] | undefined;
    /**
     * @description The categories associated with the thread.
     * @type array | undefined
    */
    category_tags?: string[] | undefined;
};

import type { GenericResponse } from "./GenericResponse";
import type { Thread } from "./Thread";

export type CreateThreadPathParams = {
    /**
     * @description The id for the board in which the thread will be created.
     * @type string uuid
    */
    board_id: string;
};

export type CreateThread401 = GenericResponse;

export type CreateThread403 = GenericResponse;

export type CreateThread404 = GenericResponse;

/**
 * @description request body
*/
export type CreateThreadMutationRequest = CreateThread;

/**
 * @description Thread has been created.
*/
export type CreateThreadMutationResponse = Thread;
