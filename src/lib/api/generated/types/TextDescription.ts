import type { BaseDescription } from "./BaseDescription";

export const type4 = {
    "text": "text"
} as const;
export type Type4 = (typeof type4)[keyof typeof type4];
export type TextDescription = (BaseDescription & {
    /**
     * @type string
    */
    type: Type4;
    /**
     * @type string
    */
    description: string;
});
