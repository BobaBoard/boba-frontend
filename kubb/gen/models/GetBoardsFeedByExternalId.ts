import type { FeedActivity } from "./FeedActivity";

/**
 * @description The board was not found.
*/
export type GetBoardsFeedByExternalId404 = any | null;

export type GetBoardsFeedByExternalIdPathParams = {
    /**
     * @description The id of the board to fetch the activity of.
     * @type string
    */
    board_id: string;
};

export type GetBoardsFeedByExternalIdQueryParams = {
    /**
     * @description The cursor to start feeding the activity of the board from.
     * @type string | undefined
    */
    cursor?: string | undefined;
};

/**
 * @description The board activity.
*/
export type GetBoardsFeedByExternalIdQueryResponse = FeedActivity;
