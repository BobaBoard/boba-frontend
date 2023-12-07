
export const postPermissions = {
    "edit_content": "edit_content",
    "edit_whisper_tags": "edit_whisper_tags",
    "edit_category_tags": "edit_category_tags",
    "edit_index_tags": "edit_index_tags",
    "edit_content_notices": "edit_content_notices"
} as const;
export type PostPermissions = (typeof postPermissions)[keyof typeof postPermissions];
