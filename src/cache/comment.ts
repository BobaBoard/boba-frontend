import { setThreadInCache, setThreadPersonalIdentityInCache } from "./thread";

import { CommentType } from "types/Types";
import { QueryClient } from "react-query";

export const addCommentInCache = (
  queryClient: QueryClient,
  {
    threadId,
    boardId,
    newComments,
    replyTo,
  }: {
    threadId: string;
    boardId: string;
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
      boardId,
    },
    {
      transformThread: (thread) => {
        return {
          ...thread,
          comments: {
            ...thread.comments,
            [replyTo.postId]: [
              ...(thread.comments[replyTo.postId] || []),
              ...newComments,
            ],
          },
          newCommentsAmount: thread.newCommentsAmount + newComments.length,
          totalCommentsAmount: thread.totalCommentsAmount + newComments.length,
        };
      },
      transformThreadSummary: (thread) => {
        return {
          ...thread,
          // TODO: maybe we don't want to update the newCommentsAmount here
          // if they come from the user themselves
          newCommentsAmount:
            thread.newCommentsAmount +
            newComments.reduce(
              (current, comment) =>
                (current += comment.isNew && !comment.isOwn ? 1 : 0),
              0
            ),
          totalCommentsAmount: thread.totalCommentsAmount + newComments.length,
        };
      },
    }
  );
  if (newComments[0].isOwn) {
    setThreadPersonalIdentityInCache(queryClient, {
      boardId,
      threadId,
      personalIdentity: newComments[0].secretIdentity,
    });
  }
};
