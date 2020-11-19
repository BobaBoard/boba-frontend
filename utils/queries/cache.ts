import { queryCache } from "react-query";
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
const getThreadInActivityData = (
  activityData: BoardActivityResponse[] | undefined,
  threadId: string
): ThreadInActivityData | undefined => {
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

const updateThreadInActivity = (
  activityData: BoardActivityResponse[] | undefined,
  threadId: string,
  updateThread: (thread: ThreadType) => void
) => {
  const threadData = getThreadInActivityData(activityData, threadId);
  if (!threadData || !activityData) {
    return;
  }
  const newThread = {
    ...threadData.thread,
  };

  updateThread(newThread);

  activityData[threadData.activityDataIndex].activity[
    threadData.threadIndex
  ] = newThread;
};

const removeThreadActivity = (
  activityData: BoardActivityResponse[] | undefined,
  threadId: string
) => {
  updateThreadInActivity(activityData, threadId, (thread) => {
    thread.posts[0].isNew = false;
    thread.posts[0].newCommentsAmount = 0;
    thread.posts[0].newPostsAmount = 0;
    thread.isNew = false;
    thread.newCommentsAmount = 0;
    thread.newPostsAmount = 0;
  });
};

export const removeThreadActivityFromCache = ({
  slug,
  categoryFilter,
  threadId,
}: {
  slug: string;
  categoryFilter: string | null;
  threadId: string;
}) => {
  const boardActivityData = queryCache.getQueryData<BoardActivityResponse[]>([
    "boardActivityData",
    { slug, categoryFilter },
  ]);
  const userActivityData = queryCache.getQueryData<BoardActivityResponse[]>([
    "userActivityData",
  ]);

  removeThreadActivity(boardActivityData, threadId);
  removeThreadActivity(userActivityData, threadId);

  queryCache.setQueryData(
    ["boardActivityData", { slug, categoryFilter }],
    () => boardActivityData
  );
  queryCache.setQueryData(["userActivityData"], () => userActivityData);
};

export const setThreadMutedInCache = ({
  slug,
  categoryFilter,
  threadId,
  mute,
}: {
  slug: string;
  categoryFilter: string | null;
  threadId: string;
  mute: boolean;
}) => {
  const boardActivityData = queryCache.getQueryData<BoardActivityResponse[]>([
    "boardActivityData",
    { slug, categoryFilter },
  ]);
  const userActivityData = queryCache.getQueryData<BoardActivityResponse[]>([
    "userActivityData",
  ]);

  updateThreadInActivity(
    boardActivityData,
    threadId,
    (thread) => (thread.muted = mute)
  );
  updateThreadInActivity(
    userActivityData,
    threadId,
    (thread) => (thread.muted = mute)
  );

  queryCache.setQueryData(
    ["boardActivityData", { slug }],
    () => boardActivityData
  );
  queryCache.setQueryData(["userActivityData"], () => userActivityData);
};

export const setBoardMutedInCache = ({
  slug,
  mute,
}: {
  slug: string;
  mute: boolean;
}) => {
  const boardData = queryCache.getQueryData<BoardData>([
    "boardThemeData",
    { slug },
  ]);
  if (!boardData) {
    error(`Board wasn't found in data after marking board ${slug} as muted`);
    return;
  }

  boardData.muted = mute;

  queryCache.setQueryData(["boardThemeData", { slug }], { ...boardData });
};

export const setBoardPinnedInCache = ({
  slug,
  pin,
  nextPinnedOrder,
}: {
  slug: string;
  pin: boolean;
  nextPinnedOrder: number;
}) => {
  const boardData = queryCache.getQueryData<BoardData>([
    "boardThemeData",
    { slug },
  ]);
  if (!boardData) {
    error(`Board wasn't found in data after marking board ${slug} as muted`);
    return;
  }

  boardData.pinnedOrder = nextPinnedOrder;

  queryCache.setQueryData(["boardThemeData", { slug }], { ...boardData });
};

export const setThreadHiddenInCache = ({
  slug,
  categoryFilter,
  threadId,
  hide,
}: {
  slug: string;
  categoryFilter: string | null;
  threadId: string;
  hide: boolean;
}) => {
  const boardActivityData = queryCache.getQueryData<BoardActivityResponse[]>([
    "boardActivityData",
    { slug, categoryFilter },
  ]);
  const userActivityData = queryCache.getQueryData<BoardActivityResponse[]>([
    "userActivityData",
  ]);
  updateThreadInActivity(
    boardActivityData,
    threadId,
    (thread) => (thread.hidden = hide)
  );
  updateThreadInActivity(
    userActivityData,
    threadId,
    (thread) => (thread.hidden = hide)
  );

  queryCache.setQueryData(
    ["boardActivityData", { slug }],
    () => boardActivityData
  );
  queryCache.setQueryData(["userActivityData"], () => userActivityData);
};

export const setDefaultThreadViewInCache = ({
  slug,
  categoryFilter,
  threadId,
  view,
}: {
  slug: string;
  categoryFilter: string | null;
  threadId: string;
  view: ThreadType["defaultView"];
}) => {
  const boardActivityData = queryCache.getQueryData<BoardActivityResponse[]>([
    "boardActivityData",
    { slug, categoryFilter },
  ]);
  const userActivityData = queryCache.getQueryData<BoardActivityResponse[]>([
    "userActivityData",
  ]);
  updateThreadInActivity(
    boardActivityData,
    threadId,
    (thread) => (thread.defaultView = view)
  );
  updateThreadInActivity(
    userActivityData,
    threadId,
    (thread) => (thread.defaultView = view)
  );

  queryCache.setQueryData(
    ["boardActivityData", { slug }],
    () => boardActivityData
  );
  queryCache.setQueryData(["userActivityData"], () => userActivityData);
};

export const updateCommentCache = ({
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
}) => {
  const threadData = queryCache.getQueryData<ThreadType>([
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
  queryCache.setQueryData(["threadData", { threadId }], () => ({
    ...threadData,
    posts: newPosts,
  }));
  return true;
};

export const updatePostCache = ({
  threadId,
  post,
}: {
  threadId: string;
  post: PostType;
}) => {
  const threadData = queryCache.getQueryData<ThreadType>([
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
  queryCache.setQueryData(["threadData", { threadId }], () => newThreadData);
  return true;
};

export const updatePostTagsInCache = ({
  threadId,
  postId,
  tags,
}: {
  threadId: string;
  postId: string;
  tags: TagsType;
}) => {
  const threadData = queryCache.getQueryData<ThreadType>([
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

  queryCache.setQueryData(["threadData", { threadId }], () => newThreadData);

  if (oldPostIndex == 0) {
    // This mean this is the displayed post in activities
    // TODO: do this
  }

  return true;
};

export const getThreadInBoardCache = ({
  slug,
  threadId,
  categoryFilter,
}: {
  slug: string;
  threadId: string;
  categoryFilter: string | null;
}) => {
  const boardActivityData = queryCache.getQueryData<BoardActivityResponse[]>([
    "boardActivityData",
    { slug, categoryFilter },
  ]);
  return getThreadInActivityData(boardActivityData, threadId);
};
