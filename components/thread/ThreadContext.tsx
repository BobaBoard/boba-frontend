import React from "react";

import { getThreadData } from "utils/queries";
import { useQuery, useQueryClient } from "react-query";
import {
  PostType,
  ThreadType,
  CategoryFilterType,
  ThreadPostInfoType,
  ThreadCommentInfoType,
} from "types/Types";
import {
  makePostsTree,
  extractCategories,
  applyCategoriesFilter,
  makeCommentsTree,
  extractAnswersSequence,
  UNCATEGORIZED_LABEL,
} from "utils/thread-utils";
import { getThreadInBoardCache } from "utils/queries/cache";
import moment from "moment";

import debug from "debug";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
const log = debug("bobafrontend:ThreadContext-log");
const info = debug("bobafrontend:ThreadContext-info");

export interface ThreadContextType {
  isLoading: boolean;
  isRefetching: boolean;
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
  categoryFilterState: CategoryFilterType[];
  setCategoryFilterState: React.Dispatch<
    React.SetStateAction<{ name: string; active: boolean }[]>
  >;
  hasNewReplies: boolean;
  personalIdentity?: {
    name: string;
    avatar: string;
  };
  parentBoardSlug: string | null;
  threadId: string | null;
}

const ThreadContext = React.createContext<ThreadContextType | null>(null);

export const useThreadContext = () => {
  const context = React.useContext<ThreadContextType | null>(ThreadContext);

  if (!context) {
    throw new Error("ThreadContext should be used withing a context provider.");
  }

  return context;
};

const ThreadContextProvider: React.FC<{
  slug: string;
  threadId: string;
  postId: string | null;
  children?: React.ReactNode;
}> = (props) => {
  log(
    `Rendering thread context for thread ${props.threadId} and post ${props.postId}`
  );
  const value = useThreadWithNull({
    slug: props.slug,
    threadId: props.threadId,
    postId: props.postId,
    fetch: true,
  });

  return (
    <ThreadContext.Provider value={value}>
      {props.children}
    </ThreadContext.Provider>
  );
};

export default ThreadContextProvider;

export const useThreadWithNull = ({
  threadId,
  postId,
  slug,
  fetch,
}: {
  threadId: string | null;
  postId: string | null;
  slug: string | null;
  fetch?: boolean;
}): ThreadContextType => {
  log(`Using thread with null`);
  const queryClient = useQueryClient();
  const {
    data: threadData,
    isLoading: isFetchingThread,
    isFetching: isRefetching,
  } = useQuery<
    ThreadType | null,
    [
      string,
      {
        threadId: string;
      }
    ]
  >(
    ["threadData", { threadId }],
    () => {
      if (!threadId || !slug) {
        return null;
      }
      return getThreadData({ threadId });
    },
    {
      refetchOnWindowFocus: false,
      placeholderData: () => {
        if (!threadId || !slug) {
          return null;
        }
        info(
          `Searching board activity data for board ${slug} and thread ${threadId}`
        );
        const thread = getThreadInBoardCache(queryClient, {
          slug,
          threadId,
          categoryFilter: null,
        });
        info(`...${thread ? "found" : "NOT found"}!`);
        return thread;
      },
      staleTime: 30 * 1000,
      notifyOnChangeProps: ["data", "isLoading", "isFetching"],
      refetchOnMount: !!fetch,
      onSuccess: (data) => {
        log(`Retrieved thread data for thread with id ${threadId}`);
        info(data);
      },
    }
  );

  // Extract posts data in a format that is easily consumable by context consumers.
  const {
    root,
    parentChildrenMap,
    newAnswersSequence,
    postCommentsMap,
    chronologicalPostsSequence,
  } = React.useMemo(() => {
    log(`Building posts tree for thread ${threadId}`);
    info("Thread data:", threadData);
    const {
      root = null,
      parentChildrenMap = new Map(),
      postsDisplaySequence = [],
    } = threadId ? makePostsTree(threadData?.posts, threadId) : {};
    const postCommentsMap = new Map<string, ThreadCommentInfoType>();
    threadData?.posts?.forEach((post) => {
      if (post.comments) {
        postCommentsMap.set(post.postId, makeCommentsTree(post.comments));
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

    return {
      root,
      parentChildrenMap,
      postCommentsMap,
      chronologicalPostsSequence,
      newAnswersSequence: postsDisplaySequence
        ? extractAnswersSequence(postsDisplaySequence, postCommentsMap)
        : [],
    };
  }, [threadData, threadId]);

  // Listen to category filter changes and update data accordingly.
  const [categoryFilterState, setCategoryFilterState] = React.useState<
    CategoryFilterType[]
  >([]);

  React.useEffect(() => {
    if (!threadData) {
      setCategoryFilterState((categoryFilterState) =>
        categoryFilterState.length > 0 ? [] : categoryFilterState
      );
      return;
    }
    const currentCategories = extractCategories(threadData?.posts || []);
    currentCategories.push(UNCATEGORIZED_LABEL);
    log(`Current categories:`);
    log(currentCategories);
    setCategoryFilterState((categoryFilterState) =>
      currentCategories.map((category) => ({
        name: category,
        active:
          categoryFilterState.find(
            (stateCategory) => stateCategory.name == category
          )?.active || true,
      }))
    );
  }, [threadData, threadId]);

  const {
    root: filteredRoot,
    parentChildrenMap: filteredParentChildrenMap,
  } = React.useMemo(
    () => applyCategoriesFilter(root, parentChildrenMap, categoryFilterState),
    [root, parentChildrenMap, categoryFilterState]
  );

  return {
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
    categories: React.useMemo(() => extractCategories(threadData?.posts), [
      threadData?.posts,
    ]),
    categoryFilterState,
    setCategoryFilterState,
    postCommentsMap,
    chronologicalPostsSequence,
    defaultView: threadData?.defaultView || null,
    personalIdentity: threadData?.personalIdentity,
    isRefetching,
    hasNewReplies:
      !!threadData?.newCommentsAmount || !!threadData?.newPostsAmount,
    parentBoardSlug: threadData?.boardSlug || null,
    threadId: threadId,
  };
};

// TODO: readd mark as read.
type Subtract<T, V> = Pick<T, Exclude<keyof T, keyof V>>;
export const withThreadData = <P extends ThreadContextType>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    fetch?: boolean;
  }
) => {
  const ReturnedComponent: React.FC<Subtract<P, ThreadContextType>> = (
    props: P
  ) => {
    const { postId, slug, threadId } = usePageDetails<ThreadPageDetails>();
    const threadData = useThreadWithNull({
      threadId,
      postId,
      slug,
      fetch: options?.fetch,
    });
    return <WrappedComponent {...threadData} {...props} />;
  };
  ReturnedComponent.displayName = `${
    WrappedComponent.displayName || WrappedComponent.name
  }_withThreadData`;
  ReturnedComponent.whyDidYouRender = true;
  return ReturnedComponent;
};
