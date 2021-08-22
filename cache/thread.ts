import { QueryClient } from "react-query";
import { BoardActivityResponse, ThreadType } from "../types/Types";
import { setActivitiesInCache } from "./activity";

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
        return undefined;
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
      queryKey: ["threadData", { threadId: key.threadId }],
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
    thread.posts[0].isNew = false;
    thread.posts[0].newCommentsAmount = 0;
    thread.posts[0].newPostsAmount = 0;
    thread.isNew = false;
    thread.newCommentsAmount = 0;
    thread.newPostsAmount = 0;
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

export const setThreadIdentityInCache = () => {
  // TODO: fill this
  // Get personal identity from thread in cache
  // Update the thread with it
};

// export const getThreadInCache = (
//   queryClient: QueryClient,
//   {
//     slug,
//     threadId,
//   }: {
//     slug?: string;
//     threadId: string;
//   }
// ) => {
//   const queries = getActivityQueries(queryClient, { slug });

//   for (const query of queries) {
//     const thread = getThreadInActivityData(
//       query.state.data as InfiniteData<BoardActivityResponse>,
//       threadId
//     )?.thread;
//     if (thread) {
//       return thread;
//     }
//   }
//   return null;
// };

// export const clearThreadData = (
//   queryClient: QueryClient,
//   {
//     slug,
//     threadId,
//   }: {
//     slug: string;
//     threadId: string;
//   }
// ) => {
//   queryClient.setQueryData(["threadData", { threadId }], () =>
//     getThreadInCache(queryClient, { slug, threadId })
//   );
//   queryClient.invalidateQueries(["threadData", { threadId }]);
// };
