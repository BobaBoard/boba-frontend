import { QueryClient } from "react-query";
import { CommentType, PostType } from "../types/Types";
import { setPostInCache } from "./post";
import { setThreadPersonalIdentityInCache } from "./thread";

export const addCommentInCache = (
  queryClient: QueryClient,
  {
    threadId,
    slug,
    newComments,
    replyTo,
  }: {
    threadId: string;
    slug: string;
    newComments: CommentType[];
    replyTo: {
      postId: string;
      commentId: string | null;
    };
  }
) => {
  setPostInCache(
    queryClient,
    {
      threadId,
      slug,
      postId: replyTo.postId,
    },
    (post: PostType) => {
      return {
        ...post,
        newCommentsAmount: post.newCommentsAmount + 1,
        comments: [...(post.comments || []), ...newComments],
      };
    }
  );
  if (newComments[0].isOwn) {
    setThreadPersonalIdentityInCache(queryClient, {
      slug,
      threadId,
      personalIdentity: newComments[0].secretIdentity,
    });
  }
};
