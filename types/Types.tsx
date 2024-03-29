export interface SecretIdentityType {
  name: string;
  avatar: string;
  accessory?: string;
  color?: string;
}

export interface UserIdentityType {
  name: string;
  avatar: string;
}

export interface CommentType {
  commentId: string;
  parentCommentId: string | null;
  parentPostId: string;
  chainParentId: string | null;
  content: string;
  secretIdentity: SecretIdentityType;
  userIdentity?: UserIdentityType;
  created: string;
  isNew: boolean;
  isOwn: boolean;
}

export interface TagsType {
  whisperTags: string[];
  indexTags: string[];
  categoryTags: string[];
  contentWarnings: string[];
}

export interface PostType {
  postId: string;
  threadId: string;
  parentPostId: string | null;
  secretIdentity: SecretIdentityType;
  userIdentity?: UserIdentityType;
  created: string;
  content: string;
  options: {
    wide?: boolean;
  };
  tags: TagsType;
  isNew: boolean;
  isOwn: boolean;
}

export interface ThreadSummaryType {
  id: string;
  parentBoardId: string;
  parentBoardSlug: string;
  starter: PostType;
  defaultView: "thread" | "gallery" | "timeline";
  muted: boolean;
  hidden: boolean;
  new: boolean;
  newPostsAmount: number;
  newCommentsAmount: number;
  totalPostsAmount: number;
  totalCommentsAmount: number;
  directThreadsAmount: number;
  lastActivityAt: string;
  personalIdentity?: UserIdentityType;
}
export interface ThreadType extends ThreadSummaryType {
  posts: PostType[];
  comments: Record<string, CommentType[]>;
}

export interface Cursor {
  next: string | null;
}

export interface FeedType {
  cursor: Cursor;
  // This thread will only have the top post and no comments.
  activity: ThreadSummaryType[];
}
export interface BoardTextDescription {
  id: string;
  index: number;
  title: string;
  type: "text";
  description: string;
}

export interface BoardCategoryDescription {
  id: string;
  index: number;
  title: string;
  type: "category_filter";
  categories: string[];
}

export type BoardDescription = BoardCategoryDescription | BoardTextDescription;

export interface Role {
  id: string;
  name: string;
  color?: string;
  accessory?: string;
  avatarUrl: string;
}

export interface Accessory {
  id: string;
  name: string;
  accessory: string;
}

export enum ThreadPermissions {
  editDefaultView,
  moveThread = "move_thread",
}

export enum BoardPermissions {
  editMetadata = "edit_board_details",
}

export enum PostPermissions {
  editContent = "edit_content",
  editWhisperTags = "edit_whisper_tags",
  editCategoryTags = "edit_category_tags",
  editIndexTags = "edit_index_tags",
  editContentNotices = "edit_content_notices",
}

export interface Permissions {
  boardPermissions: BoardPermissions[];
  postPermissions: PostPermissions[];
  threadPermissions: ThreadPermissions[];
}

export enum RealmPermissions {
  CREATE_REALM_INVITE = "create_realm_invite",
  POST_ON_REALM = "post_on_realm",
  COMMENT_ON_REALM = "comment_on_realm",
  CREATE_THREAD_ON_REALM = "create_thread_on_realm",
  ACCESS_LOCKED_BOARDS_ON_REALM = "access_locked_boards_on_realm",
}

export interface BoardData {
  slug: string;
  avatarUrl: string;
  tagline: string;
  accentColor: string;
  descriptions: BoardDescription[];
  muted: boolean;
  loggedInOnly: boolean;
  delisted: boolean;
  pinnedOrder: number | null;
  hasUpdates?: boolean;
  lastUpdate?: Date;
  lastUpdateFromOthers?: Date;
  lastVisit?: Date;
  permissions?: Permissions;
  postingIdentities?: Role[];
  suggestedCategories?: string[];
  accessories?: Accessory[];
}

export interface BoardSummary {
  id: string;
  realmId: string;
  slug: string;
  avatarUrl: string;
  tagline: string;
  accentColor: string;
  loggedInOnly: boolean;
  delisted: boolean;
  muted?: boolean;
  pinned?: boolean;
}

export interface BoardMetadata extends BoardSummary {
  descriptions: BoardDescription[];
  permissions?: Permissions;
  postingIdentities?: Role[];
  accessories?: Accessory[];
}

export interface PostData {
  content: string;
  forceAnonymous: boolean;
  defaultView: "thread" | "gallery" | "timeline";
  whisperTags: string[];
  indexTags: string[];
  categoryTags: string[];
  contentWarnings: string[];
  identityId?: string;
  accessoryId?: string;
}

export interface CommentData {
  content: string;
  forceAnonymous: boolean;
  replyToCommentId: string | null;
  identityId?: string;
  accessoryId?: string;
}

export interface CategoryFilterType {
  name: string;
  active: boolean;
}

export interface ThreadPostInfoType {
  children: PostType[];
  post: PostType;
  parent: PostType | null;
}

/**
 * Information about a collection of comment threads.
 */
export interface ThreadCommentInfoType {
  /**
   * A list of top-level comments. All other comments
   * must belong to a subtree that has these comments as root.
   */
  roots: CommentType[];
  /**
   * A map from the id of a comment in a chain to the data of the next
   * comment in that same chain.
   */
  parentChainMap: Map<string, CommentType>;
  /**
   * A map from the id of a comment to the data of the top-level comments that
   * are a direct reply to it.
   *
   * When the reply is to a chain, the key will be the id of the last comment in
   * the chain.
   */
  parentChildrenMap: Map<string, CommentType[]>;
  total: number;
  new: number;
}

export interface SettingsType {
  decorations: {
    name: string;
    value: unknown;
    type: string;
  }[];
}

export interface BobadexSeasonType {
  id: string;
  name: string;
  realmId: string;
  identitiesCount: number;
  caughtIdentities: (SecretIdentityType & { id: string; index: number })[];
}

export const isPost = (
  object: PostType | CommentType | ThreadSummaryType
): object is PostType => {
  return (object as PostType).postId !== undefined;
};

export const isComment = (
  object: PostType | CommentType | ThreadSummaryType
): object is CommentType => {
  return (object as CommentType).commentId !== undefined;
};

export const isThread = (
  object: PostType | CommentType | ThreadSummaryType
): object is ThreadType => {
  // A thread must always have a starter object
  return (object as ThreadType).starter !== undefined;
};

export interface CssVariableSetting {
  name: string;
  type: "CssVariable";
  value: string;
}

interface BaseBlock {
  id: string;
  title: string;
  index: number;
  type: "rules" | "subscription";
}

export interface RulesBlock extends BaseBlock {
  type: "rules";
  rules: {
    title: string;
    description: string;
    pinned: boolean;
    index: number;
  }[];
}

export interface SubscriptionBlock extends BaseBlock {
  id: string;
  type: "subscription";
  subscriptionId: string;
}

export type UiBlocks = RulesBlock | SubscriptionBlock;

export interface RealmType {
  id: string;
  slug: string;
  icon: string;
  favicon: string | null;
  title: string | null;
  description: string | null;
  feedbackFormUrl: string | null;
  settings: {
    root: {
      cursor?: {
        image: string | undefined;
        trail: string | undefined;
      };
    };
    indexPage: CssVariableSetting[];
    boardPage: CssVariableSetting[];
    threadPage: CssVariableSetting[];
  };
  homepage: {
    blocks: UiBlocks[];
  };
  realmPermissions: RealmPermissions[];
  boards: BoardSummary[];
}

export interface BoardNotifications {
  id: string;
  hasUpdates: boolean;
  isOutdated: boolean;
  lastActivityAt: Date | null;
  lastActivityFromOthersAt: Date | null;
  lastVisitedAt: Date | null;
}

export interface UserNotifications {
  hasNotifications: boolean;
  isOutdatedNotifications: boolean;
  realmId: string;
  realmBoards: Record<string, BoardNotifications>;
  pinnedBoards: Record<string, BoardNotifications>;
}

export interface RealmInvite {
  realmId: string;
  inviteUrl: string;
}

export interface DetailedRealmInvite extends RealmInvite {
  own: boolean;
  issuedAt: Date;
  expiresAt: Date;
  inviteeEmail?: string;
  label?: string;
}

interface Subscription {
  id: string;
  name: string;
  last_activity_at: string | null;
}

export interface SubscriptionFeed {
  cursor: {
    next: string | null;
  };
  subscription: Subscription;
  activity: PostType[];
}
