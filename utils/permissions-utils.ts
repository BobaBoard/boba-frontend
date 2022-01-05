import { PostPermissions } from "types/Types";

export const isPostEditPermission = (postPermission: PostPermissions) => {
  return [
    PostPermissions.editContent,
    PostPermissions.editWhisperTags,
    PostPermissions.editCategoryTags,
    PostPermissions.editWhisperTags,
    PostPermissions.editContentNotices,
  ].includes(postPermission);
};
