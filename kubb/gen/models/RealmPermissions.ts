
export const realmPermissions = {
    "create_realm_invite": "create_realm_invite",
    "post_on_realm": "post_on_realm",
    "comment_on_realm": "comment_on_realm",
    "create_thread_on_realm": "create_thread_on_realm",
    "access_locked_boards_on_realm": "access_locked_boards_on_realm"
} as const;
export type RealmPermissions = (typeof realmPermissions)[keyof typeof realmPermissions];
