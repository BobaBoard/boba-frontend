import { QueryClient } from "react-query";
import {
  PostType,
  ThreadType,
  TagsType,
  ThreadSummaryType,
} from "../types/Types";
import { setThreadInCache, setThreadPersonalIdentityInCache } from "./thread";

export const setPostInCache = (
  queryClient: QueryClient,
  {
    threadId,
    slug,
    postId,
  }: {
    threadId: string;
    slug: string;
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
    return newThread;
  };
  setThreadInCache(
    queryClient,
    { slug, threadId },
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
    slug,
    post,
  }: {
    threadId: string;
    slug: string;
    post: PostType;
  }
) => {
  setThreadInCache(
    queryClient,
    { slug, threadId },
    {
      transformThread: (thread) => {
        return {
          ...thread,
          posts: [...thread.posts, post],
          newPostsAmount: thread.newPostsAmount + (post.isNew ? 1 : 0),
          totalPostsAmount: thread.totalPostsAmount + 1,
        };
      },
      transformThreadSummary: (thread) => {
        return {
          ...thread,
          newPostsAmount: thread.newPostsAmount + (post.isNew ? 1 : 0),
          totalPostsAmount: thread.totalPostsAmount + 1,
        };
      },
    }
  );
  if (post.isOwn) {
    setThreadPersonalIdentityInCache(queryClient, {
      slug,
      threadId,
      personalIdentity: post.secretIdentity,
    });
  }
};

export const setPostTagsInCache = (
  queryClient: QueryClient,
  {
    threadId,
    slug,
    postId,
    tags,
  }: {
    threadId: string;
    slug: string;
    postId: string;
    tags: TagsType;
  }
) => {
  setPostInCache(queryClient, { slug, threadId, postId }, (post) => {
    return {
      ...post,
      tags,
    };
  });
};
