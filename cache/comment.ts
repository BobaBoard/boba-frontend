import { QueryClient } from "react-query";
import { CommentType, PostType } from "../types/Types";
import { setPostInCache } from "./post";

export const setCommentInCache = (
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
      postId: string | null;
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
};
