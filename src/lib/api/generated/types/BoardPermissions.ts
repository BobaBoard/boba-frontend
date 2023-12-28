
export const boardPermissions = {
    "edit_board_details": "edit_board_details"
} as const;
export type BoardPermissions = (typeof boardPermissions)[keyof typeof boardPermissions];
