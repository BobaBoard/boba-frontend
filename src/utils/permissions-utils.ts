import { PostPermissions, RealmPermissions } from "types/Types";

export const isPostEditPermission = (postPermission: PostPermissions) => {
  return [
    PostPermissions.editContent,
    PostPermissions.editWhisperTags,
    PostPermissions.editCategoryTags,
    PostPermissions.editWhisperTags,
    PostPermissions.editContentNotices,
  ].includes(postPermission);
};

const ADMIN_PERMISSIONS = [RealmPermissions.CREATE_REALM_INVITE];

export const hasAdminPanelAccess = (permissions: RealmPermissions[]) => {
  const userAdminPermissions = permissions.filter((permission) => {
    return ADMIN_PERMISSIONS.includes(permission);
  });
  return !!userAdminPermissions.length;
};
