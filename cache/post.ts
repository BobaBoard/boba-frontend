import { QueryClient } from "react-query";
import { PostType, ThreadType, TagsType } from "../types/Types";
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
  setThreadInCache(queryClient, { slug, threadId }, (thread: ThreadType) => {
    const postIndex = thread.posts.findIndex((post) => post.postId == postId);
    if (postIndex != -1) {
      const updatedPost = transform(thread.posts[postIndex]);
      if (updatedPost !== thread.posts[postIndex]) {
        const updatedPosts = [...thread.posts];
        updatedPosts[postIndex] = updatedPost;
        return { ...thread, posts: updatedPosts };
      }
    }
    return thread;
  });
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
  setThreadInCache(queryClient, { slug, threadId }, (thread: ThreadType) => {
    const newThreadData = {
      ...thread,
      posts: [...thread.posts, post],
    };
    return newThreadData;
  });
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
