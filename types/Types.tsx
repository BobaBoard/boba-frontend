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
  isNew: boolean;
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
export interface ThreadType {
  posts: PostType[];
  threadId: string;
  isNew: boolean;
  newPostsAmount: number;
  newCommentsAmount: number;
  totalCommentsAmount: number;
  totalPostsAmount: number;
}

export interface BoardActivityResponse {
  nextPageCursor?: string;
  // This thread will only have the top post and no comments.
  activity: ThreadType[];
}

export interface BoardData {
  slug: string;
  avatarUrl: string;
  tagline: string;
  accentColor: string;
}

export interface PostData {
  content: string;
  large: boolean;
  forceAnonymous: boolean;
  whisperTags: string[];
}

export interface CommentData {
  content: string;
  forceAnonymous: boolean;
}
