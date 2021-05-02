import { InfiniteData, Query, QueryClient } from "react-query";
import {
  BoardActivityResponse,
  BoardData,
  CommentType,
  PostType,
  ThreadType,
  TagsType,
} from "../../types/Types";

import debug from "debug";
const error = debug("bobafrontend:boardPage-error");
const log = debug("bobafrontend:boardPage-log");

interface ThreadInActivityData {
  thread: ThreadType;
  activityDataIndex: number;
  threadIndex: number;
}

const getActivityQueries = (
  queryClient: QueryClient,
  data: { slug: string }
) => {
  const boardActivityData = queryClient
    .getQueryCache()
    .findAll(["boardActivityData", { slug: data.slug }]);
  const userActivityData = queryClient
    .getQueryCache()
    .findAll(["userActivityData"]);

  return [...boardActivityData, ...userActivityData];
};

const getThreadInActivityData = (
  data: InfiniteData<BoardActivityResponse> | undefined,
  threadId: string
): ThreadInActivityData | undefined => {
  const activityData = data?.pages;
  if (!activityData) {
    return undefined;
  }
  for (let i = 0; i < activityData?.length; i++) {
    const threadIndex = activityData[i].activity.findIndex(
      (thread) => thread.threadId == threadId
    );
    if (threadIndex != -1) {
      return {
        thread: activityData[i].activity[threadIndex],
        activityDataIndex: i,
        threadIndex,
      };
    }
  }
  return undefined;
};

const updateThreadInQueries = (
  queries: Query[],
  threadId: string,
  updateThread: (thread: ThreadType) => void
) => {
  queries.forEach((query) => {
    const data = query.state.data as
      | InfiniteData<BoardActivityResponse>
      | undefined;
    const threadData = getThreadInActivityData(data, threadId);
    if (!threadData || !data) {
      return;
    }
    const newThread = {
      ...threadData.thread,
    };

    updateThread(newThread);

    data.pages[threadData.activityDataIndex].activity[
      threadData.threadIndex
    ] = newThread;
  });
};

const updateThreadInCache = (
  queryClient: QueryClient,
  threadId: string,
  updateThread: (thread: ThreadType) => void
) => {
  const threadData = queryClient.getQueryData<ThreadType>([
    "threadData",
    { threadId },
  ]);
  if (threadData) {
    const newThreadData = {
      ...threadData,
    };
    updateThread(newThreadData);
    queryClient.setQueryData(["threadData", { threadId }], newThreadData);
  }
};

const removeThreadActivityInQueries = (queries: Query[], threadId: string) => {
  updateThreadInQueries(queries, threadId, (thread) => {
    thread.posts[0].isNew = false;
    thread.posts[0].newCommentsAmount = 0;
    thread.posts[0].newPostsAmount = 0;
    thread.isNew = false;
    thread.newCommentsAmount = 0;
    thread.newPostsAmount = 0;
  });
};

export const removeThreadActivityFromCache = (
  queryClient: QueryClient,
  {
    slug,
    threadId,
  }: {
    slug: string;
    threadId: string;
  }
) => {
  const queries = getActivityQueries(queryClient, { slug });
  removeThreadActivityInQueries(queries, threadId);
  queries.map((query) =>
    queryClient.setQueryData(query.queryKey, () => query.state.data)
  );
};

export const setThreadMutedInCache = (
  queryClient: QueryClient,
  {
    slug,
    threadId,
    mute,
  }: {
    slug: string;
    threadId: string;
    mute: boolean;
  }
) => {
  const queries = getActivityQueries(queryClient, { slug });
  updateThreadInQueries(queries, threadId, (thread) => (thread.muted = mute));
  queries.map((query) =>
    queryClient.setQueryData(query.queryKey, () => query.state.data)
  );

  updateThreadInCache(queryClient, threadId, (thread) => (thread.muted = mute));
};

export const setBoardMutedInCache = (
  queryClient: QueryClient,
  {
    slug,
    mute,
  }: {
    slug: string;
    mute: boolean;
  }
) => {
  const boardData = queryClient.getQueryData<BoardData>([
    "boardThemeData",
    { slug },
  ]);
  if (!boardData) {
    error(`Board wasn't found in data after marking board ${slug} as muted`);
    return;
  }

  boardData.muted = mute;

  queryClient.setQueryData(["boardThemeData", { slug }], { ...boardData });
};

export const setBoardPinnedInCache = (
  queryClient: QueryClient,
  {
    slug,
    pin,
    nextPinnedOrder,
  }: {
    slug: string;
    pin: boolean;
    nextPinnedOrder: number;
  }
) => {
  const boardData = queryClient.getQueryData<BoardData>([
    "boardThemeData",
    { slug },
  ]);
  if (!boardData) {
    error(`Board wasn't found in data after marking board ${slug} as muted`);
    return;
  }

  boardData.pinnedOrder = nextPinnedOrder;

  queryClient.setQueryData(["boardThemeData", { slug }], { ...boardData });
};

export const setThreadHiddenInCache = (
  queryClient: QueryClient,
  {
    slug,
    threadId,
    hide,
  }: {
    slug: string;
    threadId: string;
    hide: boolean;
  }
) => {
  const queries = getActivityQueries(queryClient, { slug });
  updateThreadInQueries(queries, threadId, (thread) => (thread.hidden = hide));
  queries.map((query) =>
    queryClient.setQueryData(query.queryKey, () => query.state.data)
  );

  updateThreadInCache(
    queryClient,
    threadId,
    (thread) => (thread.hidden = hide)
  );
};

export const setDefaultThreadViewInCache = (
  queryClient: QueryClient,
  {
    slug,
    categoryFilter,
    threadId,
    view,
  }: {
    slug: string;
    categoryFilter: string | null;
    threadId: string;
    view: ThreadType["defaultView"];
  }
) => {
  const queries = getActivityQueries(queryClient, { slug });
  updateThreadInQueries(
    queries,
    threadId,
    (thread) => (thread.defaultView = view)
  );

  queries.map((query) =>
    queryClient.setQueryData(query.queryKey, () => query.state.data)
  );
};

export const updateCommentCache = (
  queryClient: QueryClient,
  {
    threadId,
    newComments,
    replyTo,
  }: {
    threadId: string;
    newComments: CommentType[];
    replyTo: {
      postId: string | null;
      commentId: string | null;
    };
  }
) => {
  const threadData = queryClient.getQueryData<ThreadType>([
    "threadData",
    { threadId },
  ]);
  if (!threadData) {
    log(
      `Couldn't read thread data during comment upload for thread id ${threadId}`
    );
    return false;
  }
  const parentIndex = threadData.posts.findIndex(
    (post) => post.postId == replyTo?.postId
  );
  log(`Found parent post with index ${parentIndex}`);
  if (parentIndex == -1) {
    return false;
  }
  const newPosts = [...threadData.posts];
  newPosts[parentIndex] = {
    ...threadData.posts[parentIndex],
    newCommentsAmount: threadData.posts[parentIndex].newCommentsAmount + 1,
    comments: [
      ...(threadData.posts[parentIndex].comments || []),
      ...newComments,
    ],
  };
  const newThreadData = {
    ...threadData,
    posts: newPosts,
  };
  if (!newThreadData.personalIdentity && newComments[0].isOwn) {
    newThreadData.personalIdentity = newComments[0].secretIdentity;
  }
  queryClient.setQueryData(["threadData", { threadId }], () => newThreadData);
  return true;
};

export const updatePostCache = (
  queryClient: QueryClient,
  {
    threadId,
    post,
  }: {
    threadId: string;
    post: PostType;
  }
) => {
  const threadData = queryClient.getQueryData<ThreadType>([
    "threadData",
    { threadId },
  ]);
  if (!threadData) {
    log(
      `Couldn't read thread data during post upload for thread id ${threadId}`
    );
    return false;
  }
  const oldPostIndex = threadData.posts.findIndex(
    (oldPost) => oldPost.postId == post.postId
  );
  const newThreadData = {
    ...threadData,
    posts: [...threadData.posts],
  };
  if (oldPostIndex == -1) {
    newThreadData.posts.push(post);
  } else {
    newThreadData.posts[oldPostIndex] = post;
  }
  if (!newThreadData.personalIdentity && post.isOwn) {
    newThreadData.personalIdentity = post.secretIdentity;
  }
  queryClient.setQueryData(["threadData", { threadId }], () => newThreadData);
  return true;
};

export const updatePostTagsInCache = (
  queryClient: QueryClient,
  {
    threadId,
    postId,
    tags,
  }: {
    threadId: string;
    postId: string;
    tags: TagsType;
  }
) => {
  const threadData = queryClient.getQueryData<ThreadType>([
    "threadData",
    { threadId },
  ]);
  if (!threadData) {
    log(
      `Couldn't read thread data during post upload for thread id ${threadId}`
    );
    return false;
  }
  const oldPostIndex = threadData.posts.findIndex(
    (oldPost) => oldPost.postId == postId
  );
  if (oldPostIndex == -1) {
    return;
  }
  const newThreadData = {
    ...threadData,
    posts: [...threadData.posts],
  };

  newThreadData.posts[oldPostIndex] = {
    ...threadData.posts[oldPostIndex],
    tags,
  };

  queryClient.setQueryData(["threadData", { threadId }], () => newThreadData);

  if (oldPostIndex == 0) {
    // This mean this is the displayed post in activities
    // TODO: do this
  }

  return true;
};

export const clearThreadData = (
  queryClient: QueryClient,
  {
    slug,
    threadId,
  }: {
    slug: string;
    threadId: string;
  }
) => {
  queryClient.setQueryData(["threadData", { threadId }], () =>
    getThreadInBoardCache(queryClient, { slug, threadId, categoryFilter: null })
  );
  queryClient.invalidateQueries(["threadData", { threadId }]);
};

export const getThreadInBoardCache = (
  queryClient: QueryClient,
  {
    slug,
    threadId,
    categoryFilter,
  }: {
    slug: string;
    threadId: string;
    categoryFilter: string | null;
  }
) => {
  const queries = getActivityQueries(queryClient, { slug });

  for (const query of queries) {
    const thread = getThreadInActivityData(
      query.state.data as InfiniteData<BoardActivityResponse>,
      threadId
    )?.thread;
    if (thread) {
      return thread;
    }
  }
  return null;
};
