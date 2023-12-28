import type { BaseDescription } from "./BaseDescription";

export const type5 = {
    "category_filter": "category_filter"
} as const;
export type Type5 = (typeof type5)[keyof typeof type5];
export type CategoryFilterDescription = (BaseDescription & {
    /**
     * @type string
    */
    type: Type5;
    /**
     * @type array
    */
    categories: string[];
});
