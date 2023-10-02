import type { Cursor } from "./Cursor";
import type { Subscription } from "./Subscription";
import type { Contribution } from "./Contribution";

export type SubscriptionActivity = {
    cursor?: Cursor | undefined;
    subscription: Subscription;
    /**
     * @type array
    */
    activity: Contribution[];
};
