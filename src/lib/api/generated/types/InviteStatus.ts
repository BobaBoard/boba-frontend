
export const inviteStatusInviteStatus = {
    "pending": "pending",
    "used": "used",
    "expired": "expired"
} as const;
export type InviteStatusInviteStatus = (typeof inviteStatusInviteStatus)[keyof typeof inviteStatusInviteStatus];
export type InviteStatus = {
    /**
     * @type string uuid
    */
    realm_id: string;
    /**
     * @type string
    */
    realm_slug: string;
    /**
     * @type string
    */
    invite_status: InviteStatusInviteStatus;
    /**
     * @type boolean
    */
    requires_email: boolean;
};
