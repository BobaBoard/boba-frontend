import type { Cursor } from "./Cursor";

export type SearchParams = {
    /**
     * @type boolean | undefined
    */
    showRead?: boolean;
    /**
     * @type boolean | undefined
    */
    ownOnly?: boolean;
    /**
     * @type string | undefined
    */
    realmId?: string;
    cursor?: Cursor;
};
