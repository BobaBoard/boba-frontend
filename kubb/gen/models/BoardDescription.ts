import type { Description } from "./Description";

export type BoardDescription = {
    /**
     * @description Array of updated description objects.
     * @type array | undefined
    */
    descriptions?: Description[] | undefined;
    /**
     * @description Board accent color.
     * @type string | undefined
    */
    accentColor?: string | undefined;
    /**
     * @description Board tagline.
     * @type string | undefined
    */
    tagline?: string | undefined;
};
