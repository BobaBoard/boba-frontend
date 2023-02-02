import { PostType, TagsType, ThreadSummaryType, ThreadType } from "types/Types";
import { setThreadInCache, setThreadPersonalIdentityInCache } from "./thread";

import { QueryClient } from "react-query";

const setPostInCache = (
  queryClient: QueryClient,
  {
    threadId,
    boardId,
    postId,
  }: {
    threadId: string;
    boardId: string;
    postId: string;
  },
  transform: (post: PostType) => PostType
) => {
  const transformThreadSummary = (thread: ThreadSummaryType) => {
    if (thread.starter.postId !== postId) {
      return thread;
    }
    const updatedStarter = transform(thread.starter);
    if (updatedStarter == thread.starter) {
      return thread;
    }
    const newThread = { ...thread };
    newThread.new = updatedStarter.isNew;
    newThread.newPostsAmount =
      newThread.newPostsAmount +
      (updatedStarter.isNew !== thread.starter.isNew
        ? updatedStarter.isNew
          ? 1
          : -1
        : 0);
    newThread.starter = updatedStarter;
    return newThread;
  };
  setThreadInCache(
    queryClient,
    { boardId, threadId },
    {
      transformThread: (thread: ThreadType) => {
        const postIndex = thread.posts.findIndex(
          (post) => post.postId == postId
        );
        if (postIndex == -1) {
          return thread;
        }
        const oldPost = thread.posts[postIndex];
        const updatedPost = transform(oldPost);
        if (updatedPost === oldPost) {
          return thread;
        }
        const updatedPosts = [...thread.posts];
        updatedPosts[postIndex] = updatedPost;
        // If the new status of the post changes, then the total amount of new posts
        // will also have to change for the thread.
        const shouldUpdateNew = updatedPost.isNew !== oldPost.isNew;
        const newPostsAmount = !shouldUpdateNew
          ? thread.newPostsAmount
          : thread.newPostsAmount + (updatedPost.isNew ? 1 : -1);
        return {
          ...transformThreadSummary(thread),
          comments: thread.comments,
          posts: updatedPosts,
          newPostsAmount,
        };
      },
      transformThreadSummary,
    }
  );
};

export const addPostInCache = (
  queryClient: QueryClient,
  {
    threadId,
    boardId,
    post,
  }: {
    threadId: string;
    boardId: string;
    post: PostType;
  }
) => {
  setThreadInCache(
    queryClient,
    { boardId, threadId },
    {
      transformThread: (thread) => {
        return {
          ...thread,
          posts: [...thread.posts, post],
          newPostsAmount: thread.newPostsAmount + (post.isNew ? 1 : 0),
          totalPostsAmount: thread.totalPostsAmount + 1,
          directThreadsAmount:
            thread.directThreadsAmount +
            (post.parentPostId == thread.starter.postId ? 1 : 0),
        };
      },
      transformThreadSummary: (thread) => {
        return {
          ...thread,
          newPostsAmount:
            thread.newPostsAmount + (post.isNew && !post.isOwn ? 1 : 0),
          totalPostsAmount: thread.totalPostsAmount + 1,
          directThreadsAmount:
            thread.directThreadsAmount +
            (post.parentPostId == thread.starter.postId ? 1 : 0),
        };
      },
    }
  );
  if (post.isOwn) {
    setThreadPersonalIdentityInCache(queryClient, {
      boardId,
      threadId,
      personalIdentity: post.secretIdentity,
    });
  }
};

export const setPostTagsInCache = (
  queryClient: QueryClient,
  {
    threadId,
    boardId,
    postId,
    tags,
  }: {
    threadId: string;
    boardId: string;
    postId: string;
    tags: TagsType;
  }
) => {
  setPostInCache(queryClient, { boardId, threadId, postId }, (post) => {
    if (post.postId != postId) {
      return post;
    }
    return {
      ...post,
      tags: { ...tags },
    };
  });
};
