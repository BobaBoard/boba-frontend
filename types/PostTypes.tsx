export interface PostType {
  postId: string;
  threadId: string;
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
