import type { BaseBlock } from "./BaseBlock";

export const type2 = {
    "rules": "rules"
} as const;
export type Type2 = (typeof type2)[keyof typeof type2];
export type RulesBlock = (BaseBlock & {
    /**
     * @type string
    */
    type: Type2;
    /**
     * @type array
    */
    rules: {
        /**
         * @type number
        */
        index: number;
        /**
         * @type string
        */
        title: string;
        /**
         * @type string
        */
        description: string;
        /**
         * @type boolean
        */
        pinned: boolean;
    }[];
});
