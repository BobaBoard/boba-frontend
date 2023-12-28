import type { BaseBlock } from "./BaseBlock";

export const type = {
    "text": "text"
} as const;
export type Type = (typeof type)[keyof typeof type];
export type TextBlock = (BaseBlock & {
    /**
     * @type string
    */
    type: Type;
    /**
     * @type string
    */
    description: string;
});
