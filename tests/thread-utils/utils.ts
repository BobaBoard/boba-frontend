import { CommentType, PostType } from "types/Types";

export const makePost = ({
  postId,
  parentPostId,
  isNew,
}: {
  postId: string;
  parentPostId?: string;
  isNew?: boolean;
}): PostType => {
  return {
    postId,
    parentPostId: parentPostId || "",
    threadId: "",
    secretIdentity: {
      name: "",
      avatar: "",
    },
    created: "",
    content: "",
    options: {},
    tags: {
      whisperTags: [],
      indexTags: [],
      categoryTags: [],
      contentWarnings: [],
    },
    postsAmount: 0,
    commentsAmount: 0,
    threadsAmount: 0,
    newPostsAmount: 0,
    newCommentsAmount: 0,
    isNew: !!isNew,
    isOwn: false,
  };
};

export const makeComment = (properties: {
  commentId: string;
  parentCommentId?: string | null;
  chainParentId?: string | null;
  isNew?: boolean;
}): CommentType => {
  return {
    parentCommentId: null,
    chainParentId: null,
    secretIdentity: {
      name: "",
      avatar: "",
    },
    created: "",
    content: "",
    isNew: false,
    isOwn: false,
    ...properties,
  };
};
