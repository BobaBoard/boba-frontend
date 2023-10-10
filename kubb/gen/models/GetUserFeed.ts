import type { SearchParams } from "./SearchParams";
import type { FeedActivity } from "./FeedActivity";

/**
 * @description The board was not found.
*/
export type GetUserFeed404 = any | null;

export type GetUserFeedQueryParams = {
    filter?: SearchParams;
};

/**
 * @description The board activity.
*/
export type GetUserFeedQueryResponse = FeedActivity;
