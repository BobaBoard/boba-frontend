import { queryCache } from "react-query";
import {
  BoardActivityResponse,
  BoardData,
  ThreadType,
} from "../../types/Types";

import debug from "debug";
const error = debug("bobafrontend:boardPage-error");

const getThreadInActivityData = (
  activityData: BoardActivityResponse[] | undefined,
  threadId: string
) => {
  return activityData
    ?.flatMap((data) => data.activity)
    .find((thread) => thread.threadId == threadId);
};

const removeThreadActivity = (thread: ThreadType | undefined) => {
  if (!thread) {
    return;
  }
  thread.posts[0].isNew = false;
  thread.posts[0].newCommentsAmount = 0;
  thread.posts[0].newPostsAmount = 0;
  thread.isNew = false;
  thread.newCommentsAmount = 0;
  thread.newPostsAmount = 0;
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

  removeThreadActivity(getThreadInActivityData(boardActivityData, threadId));
  removeThreadActivity(getThreadInActivityData(userActivityData, threadId));

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
  const boardThread = getThreadInActivityData(boardActivityData, threadId);
  const userThread = getThreadInActivityData(userActivityData, threadId);

  if (boardThread) {
    boardThread.muted = mute;
  }
  if (userThread) {
    userThread.muted = mute;
  }

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
  const boardThread = getThreadInActivityData(boardActivityData, threadId);
  const userThread = getThreadInActivityData(userActivityData, threadId);

  if (boardThread) {
    boardThread.hidden = hide;
  }
  if (userThread) {
    userThread.hidden = hide;
  }

  queryCache.setQueryData(
    ["boardActivityData", { slug }],
    () => boardActivityData
  );
  queryCache.setQueryData(["userActivityData"], () => userActivityData);
};
