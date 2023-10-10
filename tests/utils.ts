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
    parentPostId: parentPostId || null,
    threadId: "",
    secretIdentity: {
      name: "",
      avatar: "",
    },
    userIdentity: null,
    created: "",
    content: "",
    tags: {
      whisperTags: [],
      indexTags: [],
      categoryTags: [],
      contentWarnings: [],
    },
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
    parentPostId: "",
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
