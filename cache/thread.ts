import { THREAD_QUERY_KEY } from "components/thread/ThreadContext";
import { QueryClient } from "react-query";
import { BoardActivityResponse, ThreadType } from "../types/Types";
import { getActivitiesInCache, setActivitiesInCache } from "./activity";

const setThreadInActivityCache = (
  queryClient: QueryClient,
  key: { slug: string; threadId: string },
  transform: (thread: ThreadType) => ThreadType
) => {
  setActivitiesInCache(
    queryClient,
    { slug: key.slug },
    (activity: BoardActivityResponse) => {
      const threads = activity.activity;
      if (!threads) {
        return activity;
      }
      const threadIndex = threads.findIndex(
        (thread) => thread.threadId == key.threadId
      );
      if (threadIndex != -1) {
        const updatedThreads = [...threads];
        updatedThreads[threadIndex] = transform(threads[threadIndex]);
        if (threads[threadIndex] !== updatedThreads[threadIndex]) {
          return {
            ...activity,
            activity: updatedThreads,
          };
        }
      }
      return activity;
    }
  );
};

export const setThreadInCache = (
  queryClient: QueryClient,
  key: { slug: string; threadId: string },
  transform: (thread: ThreadType) => ThreadType
) => {
  setThreadInActivityCache(queryClient, key, transform);
  queryClient.setQueriesData(
    {
      queryKey: [THREAD_QUERY_KEY, { threadId: key.threadId }],
      exact: false,
    },
    transform
  );
};

export const setThreadActivityClearedInCache = (
  queryClient: QueryClient,
  key: {
    threadId: string;
    slug: string;
  }
) => {
  setThreadInCache(queryClient, key, (thread) => {
    const newThread = {
      ...thread,
    };
    newThread.posts[0].isNew = false;
    newThread.posts[0].newCommentsAmount = 0;
    newThread.posts[0].newPostsAmount = 0;
    newThread.isNew = false;
    newThread.newCommentsAmount = 0;
    newThread.newPostsAmount = 0;
    return newThread;
  });
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
  setThreadInCache(
    queryClient,
    {
      slug,
      threadId,
    },
    (thread) => {
      if (thread.muted == mute) {
        return thread;
      }
      const newThread = { ...thread };
      newThread.muted = mute;
      return newThread;
    }
  );
};

export const setThreadDefaultViewInCache = (
  queryClient: QueryClient,
  {
    slug,
    threadId,
    view,
  }: {
    slug: string;
    categoryFilter: string | null;
    threadId: string;
    view: ThreadType["defaultView"];
  }
) => {
  setThreadInCache(
    queryClient,
    {
      slug,
      threadId,
    },
    (thread) => {
      if (thread.defaultView == view) {
        return thread;
      }
      const newThread = { ...thread };
      newThread.defaultView = view;
      return newThread;
    }
  );
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
  setThreadInCache(
    queryClient,
    {
      slug,
      threadId,
    },
    (thread) => {
      if (thread.hidden == hide) {
        return thread;
      }
      const newThread = { ...thread };
      newThread.hidden = hide;
      return newThread;
    }
  );
};

export const setThreadPersonalIdentityInCache = (
  queryClient: QueryClient,
  {
    slug,
    threadId,
    personalIdentity,
  }: {
    slug: string;
    threadId: string;
    personalIdentity:
      | {
          name: string;
          avatar: string;
        }
      | undefined;
  }
) => {
  setThreadInCache(queryClient, { slug, threadId }, (thread: ThreadType) => {
    if (thread.personalIdentity) {
      return thread;
    }
    const newThreadData = {
      ...thread,
      personalIdentity,
    };
    return newThreadData;
  });
};

export const getThreadInCache = (
  queryClient: QueryClient,
  {
    slug,
    threadId,
  }: {
    slug: string;
    threadId: string;
  }
) => {
  const activities = getActivitiesInCache(queryClient, { slug });
  for (const activity of activities) {
    for (const page of activity.pages) {
      const thread = page.activity.find(
        (thread) => thread.threadId == threadId
      );
      if (thread) {
        return thread;
      }
    }
  }
  return null;
};
