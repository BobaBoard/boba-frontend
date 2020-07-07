export interface CommentType {
  commentId: string;
  secretIdentity: {
    name: string;
    avatar: string;
  };
  userIdentity?: {
    name: string;
    avatar: string;
  };
  content: string;
  created: string;
}

export interface PostType {
  postId: string;
  threadId: string;
  parentPostId: string;
  secretIdentity: {
    name: string;
    avatar: string;
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
  tags: {
    whisperTags: string[];
  };
  comments?: CommentType[];
  postsAmount: number;
  commentsAmount: number;
  threadsAmount: number;
  newPostsAmount: number;
  newCommentsAmount: number;
  isNew: boolean;
  lastActivity: string;
}

export interface BoardActivityResponse {
  nextPageCursor?: string;
  activity: PostType[];
}

export interface BoardData {
  slug: string;
  avatarUrl: string;
  tagline: string;
  accentColor: string;
}

export interface ThreadResponse {
  stringId: string;
  newComments: number;
  totalComments: number;
  newPosts: number;
  posts: PostType[];
}

export interface PostData {
  content: string;
  large: boolean;
  forceAnonymous: boolean;
  whisperTags: string[];
}
