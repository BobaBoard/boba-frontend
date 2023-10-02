
export type PostingIdentity = {
    /**
     * @type string uuid
    */
    id: string;
    /**
     * @type string
    */
    name: string;
    /**
     * @type string | undefined uri-reference
    */
    avatar_url?: string | undefined;
    color?: (string | null) | undefined;
    accessory?: (string | null) | undefined;
};
