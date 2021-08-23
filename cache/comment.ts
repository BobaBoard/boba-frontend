import { QueryClient } from "react-query";
import { CommentType, ThreadType } from "../types/Types";
import { setThreadInCache, setThreadPersonalIdentityInCache } from "./thread";

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
  setThreadInCache(
    queryClient,
    {
      threadId,
      slug,
    },
    (thread: ThreadType) => {
      return {
        ...thread,
        newCommentsAmount: thread.newCommentsAmount + newComments.length,
        totalCommentsAmount: thread.totalCommentsAmount + newComments.length,
        comments: {
          ...thread.comments,
          [replyTo.postId]: [
            ...(thread.comments[replyTo.postId] || []),
            ...newComments,
          ],
        },
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
