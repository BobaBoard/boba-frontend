import { FeedType, ThreadSummaryType, ThreadType } from "types/Types";
import { getActivitiesInCache, setActivitiesInCache } from "./activity";

import { QueryClient } from "react-query";
import { THREAD_QUERY_KEY } from "queries/thread";

const setThreadSummaryInActivityCache = (
  queryClient: QueryClient,
  key: { boardId: string; threadId: string },
  transform: (thread: ThreadSummaryType) => ThreadSummaryType
) => {
  setActivitiesInCache(
    queryClient,
    { boardId: key.boardId },
    (activity: FeedType) => {
      const threads = activity.activity;
      if (!threads) {
        return activity;
      }
      const threadIndex = threads.findIndex(
        (thread) => thread.id == key.threadId
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

export type ThreadTransformerType = <T extends ThreadSummaryType | ThreadType>(
  thread: T
) => T;

export const setThreadInCache = (
  queryClient: QueryClient,
  key: { boardId: string; threadId: string },
  transformers: {
    transformThread: (thread: ThreadType) => ThreadType;
    transformThreadSummary: (thread: ThreadSummaryType) => ThreadSummaryType;
  }
) => {
  setThreadSummaryInActivityCache(
    queryClient,
    key,
    transformers.transformThreadSummary
  );
  // @ts-ignore unearthed through strict:true changes, not worth fixing
  queryClient.setQueriesData<ThreadType>(
    {
      queryKey: [THREAD_QUERY_KEY, { threadId: key.threadId }],
      exact: false,
    },
    transformers.transformThread
  );
};

export const setThreadActivityClearedInCache = (
  queryClient: QueryClient,
  key: {
    threadId: string;
    boardId: string;
  },
  options?: {
    activityOnly?: boolean;
  }
) => {
  const activityOnly = options?.activityOnly ?? false;
  const transformer: ThreadTransformerType = (thread) => {
    const newThread = {
      ...thread,
    };
    // For some reasons NextJS typescript compiler doesn't recognize the type inference
    // so we manually write it. At some point, this might become useless. VSCode behaves
    // as expected.
    "posts" in newThread && ((newThread as ThreadType).posts[0].isNew = false);
    newThread.starter.isNew = false;
    newThread.new = false;
    newThread.newCommentsAmount = 0;
    newThread.newPostsAmount = 0;
    return newThread;
  };
  if (!activityOnly) {
    setThreadInCache(queryClient, key, {
      transformThread: transformer,
      transformThreadSummary: transformer,
    });
  } else {
    setThreadSummaryInActivityCache(queryClient, key, transformer);
  }
};

export const setThreadMutedInCache = (
  queryClient: QueryClient,
  {
    boardId,
    threadId,
    mute,
  }: {
    boardId: string;
    threadId: string;
    mute: boolean;
  }
) => {
  const transformer: ThreadTransformerType = (thread) => {
    if (thread.muted == mute) {
      return thread;
    }
    const newThread = { ...thread };
    newThread.muted = mute;
    return newThread;
  };
  setThreadInCache(
    queryClient,
    {
      boardId,
      threadId,
    },
    {
      transformThread: transformer,
      transformThreadSummary: transformer,
    }
  );
};

export const setThreadDefaultViewInCache = (
  queryClient: QueryClient,
  {
    boardId,
    threadId,
    view,
  }: {
    boardId: string;
    categoryFilter: string | null;
    threadId: string;
    view: ThreadType["defaultView"];
  }
) => {
  const transformer: ThreadTransformerType = (thread) => {
    if (thread.defaultView == view) {
      return thread;
    }
    const newThread = { ...thread };
    newThread.defaultView = view;
    return newThread;
  };
  setThreadInCache(
    queryClient,
    {
      boardId,
      threadId,
    },
    {
      transformThread: transformer,
      transformThreadSummary: transformer,
    }
  );
};

export const setThreadHiddenInCache = (
  queryClient: QueryClient,
  {
    boardId,
    threadId,
    hide,
  }: {
    boardId: string;
    threadId: string;
    hide: boolean;
  }
) => {
  const transformer: ThreadTransformerType = (thread) => {
    if (thread.hidden == hide) {
      return thread;
    }
    const newThread = { ...thread };
    newThread.hidden = hide;
    return newThread;
  };
  setThreadInCache(
    queryClient,
    {
      boardId,
      threadId,
    },
    {
      transformThread: transformer,
      transformThreadSummary: transformer,
    }
  );
};

export const setThreadPersonalIdentityInCache = (
  queryClient: QueryClient,
  {
    boardId,
    threadId,
    personalIdentity,
  }: {
    boardId: string;
    threadId: string;
    personalIdentity:
      | {
          name: string;
          avatar: string;
        }
      | undefined;
  }
) => {
  const transformer: ThreadTransformerType = (thread) => {
    if (thread.personalIdentity) {
      return thread;
    }
    const newThreadData = {
      ...thread,
      personalIdentity,
    };
    return newThreadData;
  };
  setThreadInCache(
    queryClient,
    { boardId, threadId },
    {
      transformThread: transformer,
      transformThreadSummary: transformer,
    }
  );
};

export const getThreadSummaryInCache = (
  queryClient: QueryClient,
  {
    boardId,
    threadId,
  }: {
    boardId: string;
    threadId: string;
  }
) => {
  const activities = getActivitiesInCache(queryClient, { boardId });
  for (const activity of activities) {
    if (!activity) {
      return null;
    }
    // TODO: figure out why pages isn't here sometimes
    for (const page of activity.pages) {
      const thread = page.activity.find((thread) => thread.id == threadId);
      if (thread) {
        return thread;
      }
    }
  }
  return null;
};

export const getThreadInCache = (
  queryClient: QueryClient,
  {
    threadId,
  }: {
    threadId: string;
  }
): ThreadType | undefined => {
  return queryClient
    .getQueryCache()
    .find<ThreadType>([THREAD_QUERY_KEY, { threadId }], { exact: false })?.state
    .data;
};
