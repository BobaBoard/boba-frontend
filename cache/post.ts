import { QueryClient } from "react-query";
import { PostType, ThreadType, TagsType } from "../types/Types";
import { setThreadInCache } from "./thread";

// export const setPostInCache = (
//   queryClient: QueryClient,
//   {
//     threadId,
//     slug,
//     post,
//   }: {
//     threadId: string;
//     post: PostType;
//     slug: string;
//   }
// ) => {
//   const threadData = queryClient.getQueryData<ThreadType>([
//     "threadData",
//     { threadId },
//   ]);
//   if (!threadData) {
//     log(
//       `Couldn't read thread data during post upload for thread id ${threadId}`
//     );
//     return false;
//   }
//   const oldPostIndex = threadData.posts.findIndex(
//     (oldPost) => oldPost.postId == post.postId
//   );
//   const newThreadData = {
//     ...threadData,
//     posts: [...threadData.posts],
//   };
//   if (oldPostIndex == -1) {
//     newThreadData.posts.push(post);
//   } else {
//     newThreadData.posts[oldPostIndex] = post;
//   }
//   if (!newThreadData.personalIdentity && post.isOwn) {
//     newThreadData.personalIdentity = post.secretIdentity;
//   }
//   queryClient.setQueryData(["threadData", { threadId }], () => newThreadData);
//   return true;
// };

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

export const updatePostTagsInCache = (
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
