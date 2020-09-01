export const makePost = ({
  postId,
  parentPostId,
  isNew,
}: {
  postId: string;
  parentPostId?: string;
  isNew?: boolean;
}) => {
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
  };
};

export const makeComment = (properties: {
  commentId: string;
  parentCommentId?: string | null;
  chainParentId?: string | null;
  isNew?: boolean;
}) => {
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
    ...properties,
  };
};
