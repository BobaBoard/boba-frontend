import { queryCache } from "react-query";
import {
  BoardActivityResponse,
  BoardData,
  ThreadType,
} from "../../types/Types";

import debug from "debug";
const error = debug("bobafrontend:boardPage-error");

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
