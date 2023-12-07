
export const threadPermission = {
    "move_thread": "move_thread"
} as const;
export type ThreadPermission = (typeof threadPermission)[keyof typeof threadPermission];
