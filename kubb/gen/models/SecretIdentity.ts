
export type SecretIdentity = {
    /**
     * @type string
    */
    name: string;
    /**
     * @type string uri-reference
    */
    avatar: string;
    color?: (string | null) | undefined;
    accessory?: (string | null) | undefined;
};
