import type { Cursor } from "./Cursor";
import type { ThreadSummary } from "./ThreadSummary";

export type FeedActivity = {
    cursor?: Cursor | undefined;
    /**
     * @type array | undefined
    */
    activity?: ThreadSummary[] | undefined;
};
