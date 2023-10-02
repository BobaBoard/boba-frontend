import type { FeedActivity } from "./FeedActivity";

/**
 * @description The board was not found.
*/
export type GetPersonalFeed404 = any | null;

export type GetPersonalFeedQueryParams = {
    /**
     * @description The cursor to start feeding the activity of the board from.
     * @type string | undefined
    */
    cursor?: string | undefined;
};

/**
 * @description The board activity.
*/
export type GetPersonalFeedQueryResponse = FeedActivity;
