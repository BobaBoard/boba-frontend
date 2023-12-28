import {
  BoardData,
  BoardMetadata,
  BoardNotifications,
  BoardSummary,
  CommentType,
  DetailedRealmInvite,
  Permissions,
  PostType,
  RealmInvite,
  RealmType,
  Role,
  ThreadSummaryType,
  ThreadType,
  UserNotifications,
} from "types/Types";
import { Contribution, ThreadSummary } from "lib/api/generated";
import { DEFAULT_USER_AVATAR, DEFAULT_USER_NAME } from "components/Auth";

import { max } from "date-fns";

export const makeClientComment = (
  serverComment: any,
  parentPostId: string
): CommentType => ({
  commentId: serverComment.id,
  chainParentId: serverComment.chain_parent_id,
  parentCommentId: serverComment.parent_comment_id,
  parentPostId,
  secretIdentity: {
    name: serverComment.secret_identity.name,
    avatar: serverComment.secret_identity.avatar,
    color: serverComment.secret_identity.color,
    accessory: serverComment.secret_identity.accessory,
  },
  userIdentity: serverComment.user_identity && {
    name: serverComment.user_identity.name || DEFAULT_USER_NAME,
    avatar: serverComment.user_identity.avatar || DEFAULT_USER_AVATAR,
  },
  created: serverComment.created_at,
  content: serverComment.content,
  isNew: serverComment.new,
  isOwn: serverComment.own,
});

export const makeClientPost = (serverPost: Contribution): PostType => ({
  postId: serverPost.id,
  threadId: serverPost.parent_thread_id,
  parentPostId: serverPost.parent_post_id,
  secretIdentity: {
    name: serverPost.secret_identity.name,
    avatar: serverPost.secret_identity.avatar,
    accessory: serverPost.secret_identity.accessory,
    color: serverPost.secret_identity.color,
  },
  userIdentity: serverPost.user_identity && {
    name: serverPost.user_identity.name || DEFAULT_USER_NAME,
    avatar: serverPost.user_identity.avatar || DEFAULT_USER_AVATAR,
  },
  created: serverPost.created_at,
  content: serverPost.content,
  tags: {
    whisperTags: serverPost.tags.whisper_tags,
    indexTags: serverPost.tags.index_tags,
    categoryTags: serverPost.tags.category_tags,
    contentWarnings: serverPost.tags.content_warnings,
  },
  isNew: serverPost.new,
  isOwn: serverPost.own,
});

export const makeClientThreadSummary = (
  serverThreadSummary: ThreadSummary
): ThreadSummaryType => {
  return {
    id: serverThreadSummary.id,
    parentBoardSlug: serverThreadSummary.parent_board_slug,
    parentBoardId: serverThreadSummary.parent_board_id,
    starter: makeClientPost(serverThreadSummary.starter),
    defaultView: serverThreadSummary.default_view,
    new: serverThreadSummary.new,
    muted: serverThreadSummary.muted,
    hidden: serverThreadSummary.hidden,
    newPostsAmount: serverThreadSummary.new_posts_amount,
    newCommentsAmount: serverThreadSummary.new_comments_amount,
    totalPostsAmount: serverThreadSummary.total_posts_amount,
    totalCommentsAmount: serverThreadSummary.total_comments_amount,
    directThreadsAmount: serverThreadSummary.direct_threads_amount,
    lastActivityAt: serverThreadSummary.last_activity_at,
  };
};

export const makeClientThread = (serverThread: any): ThreadType => {
  const clientPosts: PostType[] = serverThread.posts?.map(makeClientPost) || [];
  const clientComments: Record<string, CommentType[]> = {};
  Object.keys(serverThread.comments).forEach(
    (key) =>
      (clientComments[key] = serverThread.comments[key].map((c: any) =>
        makeClientComment(c, c.parent_post_id)
      ))
  );
  const starter: PostType = makeClientPost(serverThread.starter);
  let personalIdentity = clientPosts.find((post) => post.isOwn)?.secretIdentity;
  if (!personalIdentity) {
    // Look for it within comments.
    personalIdentity = Object.values(clientComments)
      .flat()
      .find((comment) => comment?.isOwn)?.secretIdentity;
  }
  return {
    starter,
    posts: clientPosts.length > 0 ? clientPosts : [starter],
    comments: clientComments,
    new: serverThread.new,
    id: serverThread.id,
    parentBoardSlug: serverThread.parent_board_slug,
    parentBoardId: serverThread.parent_board_id,
    newPostsAmount: serverThread.new_posts_amount,
    newCommentsAmount: serverThread.new_comments_amount,
    totalCommentsAmount: serverThread.total_comments_amount,
    totalPostsAmount: serverThread.total_posts_amount,
    directThreadsAmount: serverThread.direct_threads_amount,
    lastActivityAt: serverThread.last_activity_at,
    muted: serverThread.muted,
    hidden: serverThread.hidden,
    defaultView: serverThread.default_view,
    personalIdentity,
  };
};

export const makeClientBoardData = (serverBoardData: any): BoardData => {
  let lastUpdate = null;
  if (serverBoardData.last_post) {
    lastUpdate = new Date(serverBoardData.last_post);
  }
  if (serverBoardData.last_comment) {
    const commentUpdate = new Date(serverBoardData.last_comment);
    lastUpdate = lastUpdate
      ? max([lastUpdate, commentUpdate])
      : new Date(commentUpdate);
  }
  return {
    slug: serverBoardData.slug,
    avatarUrl: serverBoardData.avatarUrl,
    tagline: serverBoardData.tagline,
    accentColor: serverBoardData.settings?.accentColor,
    loggedInOnly: serverBoardData.loggedInOnly,
    delisted: serverBoardData.delisted,
    lastUpdate: lastUpdate ? lastUpdate : undefined,
    lastUpdateFromOthers: serverBoardData.last_activity_from_others
      ? new Date(serverBoardData.last_activity_from_others)
      : undefined,
    lastVisit: serverBoardData.last_visit
      ? new Date(serverBoardData.last_visit)
      : undefined,
    descriptions: serverBoardData.descriptions || [],
    hasUpdates: serverBoardData.has_updates,
    muted: serverBoardData.muted,
    pinnedOrder: serverBoardData.pinned_order
      ? parseInt(serverBoardData.pinned_order)
      : null,
    postingIdentities: serverBoardData.postingIdentities?.map(makeClientRole),
    permissions: serverBoardData.permissions?.map(makeClientPermissions),
    accessories: serverBoardData.accessories,
  };
};

export const makeClientBoardSummary = (serverBoardData: any): BoardSummary => {
  return {
    id: serverBoardData.id,
    realmId: serverBoardData.realm_id,
    slug: serverBoardData.slug,
    tagline: serverBoardData.tagline,
    avatarUrl: serverBoardData.avatar_url,
    accentColor: serverBoardData.accent_color,
    loggedInOnly: serverBoardData.logged_in_only,
    delisted: serverBoardData.delisted,
    muted: serverBoardData.muted,
    pinned: serverBoardData.pinned,
  };
};

export const makeClientBoardMetadata = (
  serverBoardData: any
): BoardMetadata => {
  const summary = makeClientBoardSummary(serverBoardData);
  return {
    ...summary,
    descriptions: serverBoardData.descriptions,
    permissions: serverBoardData.permissions
      ? makeClientPermissions(serverBoardData.permissions)
      : undefined,
    postingIdentities:
      serverBoardData.posting_identities?.map(makeClientRole) || undefined,
    accessories: serverBoardData.accessories,
  };
};

export const makeClientPermissions = (
  serverPermissionsData: any
): Permissions => {
  return {
    boardPermissions: serverPermissionsData.board_permissions,
    threadPermissions: serverPermissionsData.thread_permissions,
    postPermissions: serverPermissionsData.post_permissions,
  };
};

export const makeClientRole = (serverRoleData: any): Role => {
  return {
    id: serverRoleData.id,
    name: serverRoleData.name,
    color: serverRoleData.color,
    accessory: serverRoleData.accessory,
    // TODO: stabilize this when the server types are also stable
    avatarUrl: serverRoleData.avatar || serverRoleData.avatar_url,
  };
};

const toCamelCaseString = (snakeCaseString: string) => {
  return snakeCaseString.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

const makeBoardNotifications = (boardNotification: any): BoardNotifications => {
  return {
    id: boardNotification.id,
    hasUpdates: boardNotification.has_updates,
    isOutdated: boardNotification.is_outdated,
    lastActivityAt: new Date(boardNotification.last_activity_at),
    lastActivityFromOthersAt: new Date(
      boardNotification.last_activity_from_others_at
    ),
    lastVisitedAt: new Date(boardNotification.last_visited_at),
  };
};

export const makeClientNotifications = (
  userNotifications: any
): UserNotifications => ({
  hasNotifications: userNotifications.has_notifications,
  isOutdatedNotifications: userNotifications.is_outdated_notifications,
  realmId: userNotifications.realm_id,
  realmBoards: Object.values(userNotifications.realm_boards).reduce<
    Record<string, BoardNotifications>
  >((agg, curr: any) => {
    agg[curr.id] = makeBoardNotifications(curr);
    return agg;
  }, {}),
  pinnedBoards: Object.values(userNotifications.pinned_boards).reduce<
    Record<string, BoardNotifications>
  >((agg, curr: any) => {
    agg[curr.id] = makeBoardNotifications(curr);
    return agg;
  }, {}),
});

export const makeRealmData = (realmData: any) => {
  return makeClientData<RealmType>(realmData);
};

export const makeClientData = <T>(serverData: any): T | unknown => {
  if (serverData === null) {
    return null;
  }
  if (Array.isArray(serverData)) {
    return serverData.map(makeClientData);
  }
  if (typeof serverData === "object") {
    const newObject = {};
    Object.entries(serverData).forEach(([key, value]) => {
      newObject[toCamelCaseString(key)] = makeClientData(value);
    });
    return newObject;
  }
  return serverData;
};

export const makeClientDetailedRealmInvite = (
  serverInvite: any
): DetailedRealmInvite => {
  return {
    realmId: serverInvite.realm_id,
    inviteUrl: serverInvite.invite_url,
    own: serverInvite.own,
    issuedAt: new Date(serverInvite.issued_at),
    expiresAt: new Date(serverInvite.expires_at),
    inviteeEmail: serverInvite.invitee_email ?? "",
    label: serverInvite.label ?? "",
  };
};

export const makeClientRealmInvite = (serverInvite: any): RealmInvite => {
  return {
    realmId: serverInvite.realm_id,
    inviteUrl: serverInvite.invite_url,
  };
};
