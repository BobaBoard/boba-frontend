
export type IdentityParams = {
    /**
     * @description The accessory to associate with the attached entity.
    */
    accessory_id?: (string | null) | undefined;
    /**
     * @description The identity to associate with the attached entity, if fixed.
    */
    identity_id?: (string | null) | undefined;
    /**
     * @description Force anonymity even among friends.
     * @deprecated
    */
    forceAnonymous?: (boolean | null) | undefined;
};
