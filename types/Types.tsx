export interface CommentType {
  commentId: string;
  parentCommentId: string | null;
  parentPostId: string;
  chainParentId: string | null;
  secretIdentity: {
    name: string;
    avatar: string;
    accessory?: string;
    color?: string;
  };
  userIdentity?: {
    name: string;
    avatar: string;
  };
  content: string;
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
  secretIdentity: {
    name: string;
    avatar: string;
    accessory?: string;
    color?: string;
  };
  userIdentity?: {
    name: string;
    avatar: string;
  };
  created: string;
  content: string;
  options: {
    wide?: boolean;
  };
  tags: TagsType;
  comments?: CommentType[];
  postsAmount: number;
  commentsAmount: number;
  threadsAmount: number;
  newPostsAmount: number;
  newCommentsAmount: number;
  isNew: boolean;
  isOwn: boolean;
}
export interface ThreadType {
  posts: PostType[];
  threadId: string;
  boardSlug: string;
  isNew: boolean;
  newPostsAmount: number;
  newCommentsAmount: number;
  totalCommentsAmount: number;
  totalPostsAmount: number;
  directThreadsAmount: number;
  lastActivity?: string;
  muted: boolean;
  hidden: boolean;
  defaultView: "thread" | "gallery" | "timeline";
  personalIdentity?: {
    name: string;
    avatar: string;
  };
}

export interface BoardActivityResponse {
  nextPageCursor: string | null;
  // This thread will only have the top post and no comments.
  activity: ThreadType[];
}

export interface BoardDescription {
  id?: number;
  index: number;
  title: string;
  type: "text" | "category_filter";
  description?: string;
  categories?: string[];
}

export interface Role {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Accessory {
  id: string;
  name: string;
  accessory: string;
}

export enum PostPermissions {
  editContent = "edit_content",
  editWhisperTags = "edit_whisper_tags",
  editCategoryTags = "edit_category_tags",
  editIndexTags = "edit_index_tags",
  editContentNotices = "edit_content_notices",
}

export interface Permissions {
  canEditBoardData: boolean;
  postsPermissions: PostPermissions;
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

export interface ThreadCommentInfoType {
  roots: CommentType[];
  parentChainMap: Map<string, CommentType>;
  parentChildrenMap: Map<string, CommentType[]>;
}

export interface SettingsType {
  decorations: {
    name: string;
    value: unknown;
    type: string;
  }[];
}

export const isPost = (object: PostType | CommentType): object is PostType => {
  return (object as PostType).postId !== undefined;
};

export const isComment = (
  object: PostType | CommentType
): object is CommentType => {
  return (object as CommentType).commentId !== undefined;
};
