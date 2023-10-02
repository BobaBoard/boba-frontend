import type { BoardPermissions } from "./BoardPermissions";
import type { PostPermissions } from "./PostPermissions";
import type { ThreadPermission } from "./ThreadPermission";

export type Permissions = {
    board_permissions: BoardPermissions;
    post_permissions: PostPermissions;
    thread_permissions: ThreadPermission;
};
