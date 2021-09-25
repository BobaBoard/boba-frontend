import {
  PostType,
  CommentType,
  ThreadType,
  BoardData,
  BoardSummary,
  Permissions,
  Role,
  ThreadSummaryType,
} from "../types/Types";

import { DEFAULT_USER_NAME, DEFAULT_USER_AVATAR } from "../components/Auth";
import { NextPageContext } from "next/dist/next-server/lib/utils";
import moment from "moment";

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
  created: serverComment.created,
  content: serverComment.content,
  isNew: serverComment.new,
  isOwn: serverComment.own,
});

export const makeClientPost = (serverPost: any): PostType => ({
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
  options: {
    wide: serverPost.options?.wide,
  },
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
  serverThreadSummary: any
): ThreadSummaryType => {
  return {
    id: serverThreadSummary.id,
    parentBoardSlug: serverThreadSummary.parent_board_slug,
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
    personalIdentity: serverThreadSummary.personal_identity,
  };
};

export const makeClientThread = (serverThread: any): ThreadType => {
  const clientPosts: PostType[] = serverThread.posts?.map(makeClientPost) || [];
  const clientComments: Record<string, CommentType[]> = {};
  Object.keys(serverThread.comments).forEach(
    (key) =>
      (clientComments[key] = serverThread.comments[key].map(makeClientComment))
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
    lastUpdate = moment.utc(serverBoardData.last_post);
  }
  if (serverBoardData.last_comment) {
    const commentUpdate = moment.utc(serverBoardData.last_comment);
    lastUpdate = lastUpdate
      ? moment.max(lastUpdate, commentUpdate)
      : moment.utc(commentUpdate);
  }
  return {
    slug: serverBoardData.slug,
    avatarUrl: serverBoardData.avatarUrl,
    tagline: serverBoardData.tagline,
    accentColor: serverBoardData.settings?.accentColor,
    loggedInOnly: serverBoardData.loggedInOnly,
    delisted: serverBoardData.delisted,
    lastUpdate: lastUpdate ? lastUpdate.toDate() : undefined,
    lastUpdateFromOthers: serverBoardData.last_activity_from_others
      ? moment.utc(serverBoardData.last_activity_from_others).toDate()
      : undefined,
    lastVisit: serverBoardData.last_visit
      ? moment.utc(serverBoardData.last_visit).toDate()
      : undefined,
    descriptions: serverBoardData.descriptions || [],
    hasUpdates: serverBoardData.has_updates,
    muted: serverBoardData.muted,
    pinnedOrder: serverBoardData.pinned_order
      ? parseInt(serverBoardData.pinned_order)
      : null,
    postingIdentities: serverBoardData.postingIdentities,
    permissions: serverBoardData.permissions,
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
    avatarUrl: serverRoleData.avatar,
  };
};

export const getCurrentHost = (
  context: NextPageContext | undefined,
  withPort?: boolean
) => {
  const serverHost = context?.req?.headers.host;
  return typeof window !== "undefined"
    ? window.location.hostname
    : serverHost?.substr(
        0,
        withPort || serverHost?.indexOf(":") == -1
          ? undefined
          : serverHost?.indexOf(":")
      );
};

const SANDBOX_LOCATIONS = ["tys-sandbox.boba.social"];
export const isSandbox = (context: NextPageContext | undefined) => {
  if (process.env.NEXT_PUBLIC_TEST_SANDBOX === "true") {
    return true;
  }
  const currentHost = getCurrentHost(context);
  return currentHost && SANDBOX_LOCATIONS.includes(currentHost);
};

const ALLOWED_SANDBOX_LOCATIONS = {
  ["localhost"]: [
    "/!gore/thread/8b2646af-2778-487e-8e44-7ae530c2549c",
    "/!anime/thread/b27710a8-0a9f-4c09-b3a5-54668bab7051",
  ],
  "tys-sandbox.boba.social": [
    "/!challenge/thread/659dc185-b10d-4dbb-84c5-641fc1a65e58",
    "/!steamy/thread/9719a1dd-96da-497e-bd71-21634c20416c",
  ],
};
export const isAllowedSandboxLocation = (
  context: NextPageContext | undefined
) => {
  if (
    !context ||
    !context.asPath ||
    !isSandbox(context) ||
    !getCurrentHost(context)
  ) {
    return true;
  }
  const currentHost = getCurrentHost(context)!;
  return ALLOWED_SANDBOX_LOCATIONS[currentHost].includes(context.asPath);
};

export const getRedirectToSandboxLocation = (
  context?: NextPageContext | undefined
) => {
  const currentHost = getCurrentHost(context);
  if (!currentHost || !isSandbox(context)) {
    throw new Error(
      "No valid current host in sandbox location, or tried sandbox redirect in non-sandbox environment."
    );
  }
  return ALLOWED_SANDBOX_LOCATIONS[currentHost][0];
};

export const isLocalhost = (context?: NextPageContext) => {
  const currentHost = getCurrentHost(context);
  return !!(
    currentHost?.startsWith("localhost") || currentHost?.startsWith("192.")
  );
};

export const isStaging = (context?: NextPageContext) => {
  if (process.env.NEXT_PUBLIC_ENV == "staging") {
    return true;
  }
  const currentHost = getCurrentHost(context);
  return !!currentHost?.startsWith("staging");
};

export const getServerBaseUrl = (context?: NextPageContext) => {
  const staging = isStaging(context);
  if (process.env.NODE_ENV == "production") {
    return staging
      ? "https://staging-dot-backend-dot-bobaboard.uc.r.appspot.com/"
      : "https://backend-dot-bobaboard.uc.r.appspot.com/";
  }

  if (process.env.NEXT_PUBLIC_DEFAULT_BACKEND) {
    return process.env.NEXT_PUBLIC_DEFAULT_BACKEND;
  }

  let backendLocation = "";
  const localhost = isLocalhost(context);
  if (localhost) {
    backendLocation = getCurrentHost(context) || "localhost";
  } else if (staging) {
    backendLocation = `staging-dot-backend-dot-bobaboard.uc.r.appspot.com`;
  } else {
    backendLocation = "backend-dot-bobaboard.uc.r.appspot.com";
  }

  // Remove the port if there is currently one
  if (backendLocation.indexOf(":") != -1) {
    backendLocation = backendLocation.substring(
      0,
      backendLocation.indexOf(":")
    );
  }

  return localhost
    ? `http://${backendLocation}:4200/`
    : `https://${backendLocation}/`;
};
