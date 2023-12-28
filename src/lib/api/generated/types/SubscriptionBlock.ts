import type { BaseBlock } from "./BaseBlock";

export const type3 = {
    "subscription": "subscription"
} as const;
export type Type3 = (typeof type3)[keyof typeof type3];
export type SubscriptionBlock = (BaseBlock & {
    /**
     * @type string
    */
    type: Type3;
    /**
     * @type string uuid
    */
    subscription_id: string;
});
