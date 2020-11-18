import React from "react";

import { getThreadData, markThreadAsRead } from "../../utils/queries";
import { useQuery, useMutation } from "react-query";
import {
  PostType,
  ThreadType,
  ThreadPostInfoType,
  ThreadCommentInfoType,
} from "../../types/Types";
import {
  makePostsTree,
  extractCategories,
  applyCategoriesFilter,
  getThreadInBoardCache,
  updateThreadReadState,
  makeCommentsTree,
  extractAnswersSequence,
  UNCATEGORIZED_LABEL,
} from "../../utils/thread-utils";
import moment from "moment";
import { unstable_trace as trace } from "scheduler/tracing";

import debug from "debug";
const log = debug("bobafrontend:useThreadData-log");
const info = debug("bobafrontend:useThreadData-info");

let performance: Performance;
if (typeof window == "undefined") {
  performance = require("perf_hooks")?.performance;
} else {
  performance = window.performance;
}

const THREAD_DATA_CACHE: Map<
  string,
  {
    posts: Map<string, ThreadPostInfoType>;
    comments: Map<string, ThreadCommentInfoType>;
  }
> = new Map();
interface ThreadDataType {
  isLoading: boolean;
  defaultView: ThreadType["defaultView"] | null;
  // The root of the thread (a.k.a. the first post).
  threadRoot: PostType | null;
  // The current post targeted by the page.
  currentRoot: PostType | null;
  chronologicalPostsSequence: PostType[];
  newAnswersSequence: { postId?: string; commentId?: string }[];
  filteredRoot: PostType | null;
  parentChildrenMap: Map<string, ThreadPostInfoType>;
  postCommentsMap: Map<string, ThreadCommentInfoType>;
  filteredParentChildrenMap: Map<string, ThreadPostInfoType>;
  categories: string[];
  categoryFilterState: { name: string; active: boolean }[];
  personalIdentity?: {
    name: string;
    avatar: string;
  };
  readThread: () => void;
}

const useThreadData = ({
  threadId,
  postId,
  slug,
  filter,
}: {
  threadId: string;
  slug: string;
  postId?: string | null;
  categoryFilterState?: { name: string; active: boolean }[];
  filter?: string;
}): ThreadDataType => {
  const { data: threadData, isFetching: isFetchingThread } = useQuery<
    ThreadType,
    [
      string,
      {
        threadId: string;
      }
    ]
  >(["threadData", { threadId }], getThreadData, {
    refetchOnWindowFocus: false,
    initialData: () => {
      log(
        `Searching board activity data for board ${slug} and thread ${threadId}`
      );
      const threadInCache = getThreadInBoardCache({ slug, threadId });
      info(threadInCache);
      return threadInCache?.thread;
    },
    isDataEqual: (oldData: ThreadType, newData: ThreadType) => {
      return !!oldData;
    },
    onSuccess: (data) => {
      console.log(performance.now());
      log(`Retrieved thread data for thread with id ${threadId}`);
      info(data);
    },
    initialStale: true,
    staleTime: 1000 * 60, // Make stale after 1 minute (remember to make stale when leaving thread)
  });

  // Mark thread as read on authentication and thread fetch
  const [readThread] = useMutation(() => markThreadAsRead({ threadId }), {
    onSuccess: () => {
      log(`Successfully marked thread as read`);
      updateThreadReadState({ threadId, slug });
    },
  });

  let cache = THREAD_DATA_CACHE.get(threadId);
  if (!cache) {
    cache = {
      posts: new Map<string, ThreadPostInfoType>(),
      comments: new Map<string, ThreadCommentInfoType>(),
    };
    THREAD_DATA_CACHE.set(threadId, cache);
  }

  // Extract posts data in a format that is easily consumable by context consumers.
  const {
    root,
    parentChildrenMap,
    newAnswersSequence,
    chronologicalPostsSequence,
  } = React.useMemo(() => {
    info("Building posts tree from data:");
    console.time("posts tree");

    const { root, parentChildrenMap, postsDisplaySequence } = makePostsTree(
      threadData?.posts,
      threadId
    );
    let treesQueue = [] as PostType[] | undefined;
    if (postId) {
      const displayedPost = threadData?.posts.find(
        (post) => post.postId == postId
      );
      if (displayedPost) {
        treesQueue = [displayedPost];
      }
    } else {
      treesQueue = threadData?.posts;
    }
    treesQueue?.forEach((post) => {
      if (post.comments) {
        let postCommentsMap = cache!.comments.get(post.postId);
        if (!postCommentsMap) {
          log(`Creating comments tree for post ${post.postId}`);
          postCommentsMap = makeCommentsTree(post.comments);
          cache!.comments.set(post.postId, postCommentsMap);
        }
      }
    });

    const chronologicalPostsSequence =
      threadData?.posts.sort((post1, post2) => {
        if (moment.utc(post1.created).isBefore(moment.utc(post2.created))) {
          return -1;
        }
        if (moment.utc(post1.created).isAfter(moment.utc(post2.created))) {
          return 1;
        }
        return 0;
      }) || [];

    log("Finished building posts tree");
    console.log(performance.now());
    console.timeEnd("posts tree");
    return {
      root,
      parentChildrenMap,
      chronologicalPostsSequence,
      newAnswersSequence: postsDisplaySequence
        ? extractAnswersSequence(postsDisplaySequence, cache!.comments)
        : [],
    };
  }, [threadData?.posts, threadId, postId]);

  const categoryFilterState = React.useMemo(() => {
    if (!threadData) {
      return [];
    }
    const currentCategories = extractCategories(threadData.posts);
    currentCategories.push(UNCATEGORIZED_LABEL);
    log(`Current categories:`);
    log(currentCategories);
    return currentCategories.map((category) => ({
      name: category,
      active: category == filter,
    }));
  }, [threadData, threadId]);

  const {
    root: filteredRoot,
    parentChildrenMap: filteredParentChildrenMap,
  } = React.useMemo(
    () => applyCategoriesFilter(root, parentChildrenMap, categoryFilterState),
    [root, parentChildrenMap, categoryFilterState]
  );

  return React.useMemo(
    () => ({
      isLoading: isFetchingThread,
      threadRoot: root,
      currentRoot:
        !!postId && threadData
          ? (threadData.posts.find((post) => post.postId == postId) as PostType)
          : root,
      newAnswersSequence,
      filteredRoot,
      parentChildrenMap,
      filteredParentChildrenMap,
      categories: extractCategories(threadData?.posts),
      categoryFilterState,
      postCommentsMap: cache!.comments,
      chronologicalPostsSequence,
      defaultView: threadData?.defaultView || null,
      personalIdentity: threadData?.personalIdentity,
      readThread,
    }),
    [root, isFetchingThread, threadData, threadId]
  );
};

export { useThreadData };
