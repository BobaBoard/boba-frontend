import React, { useState } from "react";

import { useAuth } from "components/Auth";
import { getThreadData, markThreadAsRead } from "utils/queries";
import { useQuery, useMutation } from "react-query";
import { PostType } from "types/Types";
import {
  makePostsTree,
  extractCategories,
  applyCategoriesFilter,
  getThreadInBoardCache,
  updateThreadReadState,
} from "utils/thread-utils";
import { useRouter } from "next/router";

import debug from "debug";
import { ThreadPageSSRContext } from "pages/[boardId]/thread/[...threadId]";
const log = debug("bobafrontend:threadProvider-log");
const info = debug("bobafrontend:threadProvider-info");

const ThreadContext = React.createContext({} as ThreadType);

interface ThreadType {
  // These two will never be null on thread paths.
  threadId: string;
  slug: string;
  // If the thread page points to a specific post within the thread,
  // then this will be the stringId of the post.
  postId: string | null;
  isLoading: boolean;
  // The root of the thread (a.k.a. the first post).
  threadRoot: PostType | null;
  // The current post targeted by the page.
  currentRoot: PostType | null;
  allPosts: PostType[];
  newAnswersIndex: React.RefObject<number>;
  newAnswers: React.RefObject<{ postId?: string; commentId?: string }[]>;
  filteredRoot: PostType | null;
  filteredParentChildrenMap: Map<
    string,
    { children: PostType[]; parent: PostType | null }
  >;
  categoryFilterState: { name: string; active: boolean }[];
  setCategoryFilterState: React.Dispatch<
    React.SetStateAction<{ name: string; active: boolean }[]>
  >;
  baseUrl: string;
}

const ThreadProvider: React.FC<ThreadPageSSRContext> = ({
  url,
  threadId,
  postId,
  slug,
  children,
}) => {
  log("thread provider");
  log(threadId);
  const router = useRouter();
  const { isLoggedIn, isPending: isAuthPending } = useAuth();
  const pathnameNoTrailingSlash =
    url[url.length - 1] == "/" ? url.substr(0, url.length - 1) : url;
  const baseUrl = !!postId
    ? pathnameNoTrailingSlash.substring(
        0,
        pathnameNoTrailingSlash.lastIndexOf("/") + 1
      )
    : pathnameNoTrailingSlash;

  const newAnswersIndex = React.useRef<number>(-1);
  const newAnswersArray = React.useRef<
    { postId?: string; commentId?: string }[]
  >([]);
  const [categoryFilterState, setCategoryFilterState] = React.useState<
    {
      name: string;
      active: boolean;
    }[]
  >([]);

  const { data: threadData, isFetching: isFetchingThread } = useQuery(
    ["threadData", { threadId }],
    getThreadData,
    {
      refetchOnWindowFocus: false,
      initialData: () => {
        log(
          `Searching board activity data for board ${slug} and thread ${threadId}`
        );
        return getThreadInBoardCache({ slug, threadId })?.thread;
      },
      onSuccess: (data) => {
        log(`Retrieved thread data for thread with id ${threadId}`);
        info(data);
        if (isAuthPending) {
          const attemptLogin = () => {
            if (isLoggedIn) {
              readThread();
              return;
            }
            if (isAuthPending) {
              setTimeout(attemptLogin, 500);
            }
          };
          setTimeout(attemptLogin, 500);
        } else if (isLoggedIn) {
          readThread();
        }
      },
      initialStale: true,
    }
  );

  const [readThread] = useMutation(() => markThreadAsRead({ threadId }), {
    onSuccess: () => {
      log(`Successfully marked thread as read`);
      updateThreadReadState({ threadId, slug });
    },
  });

  const {
    root,
    parentChildrenMap,
    postsDisplaySequence,
  } = React.useMemo(() => {
    info("Building posts tree from data:");
    info(threadData);
    return makePostsTree(threadData?.posts, threadId);
  }, [threadData, threadId]);
  React.useEffect(() => {
    newAnswersIndex.current = -1;
    newAnswersArray.current = [];
    if (!postsDisplaySequence) {
      return;
    }
    postsDisplaySequence.forEach((post) => {
      if (post.isNew && post.parentPostId != null) {
        newAnswersArray.current.push({ postId: post.postId });
      }
      post.comments?.forEach((comment) => {
        if (comment.isNew && !comment.chainParentId) {
          newAnswersArray.current.push({ commentId: comment.commentId });
        }
      });
    });
  }, [postsDisplaySequence]);

  React.useEffect(() => {
    if (!threadData) {
      setCategoryFilterState([]);
    }
    const currentCategories = extractCategories(threadData?.posts);
    setCategoryFilterState(
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

  return (
    <ThreadContext.Provider
      value={{
        threadId,
        postId,
        slug,
        baseUrl,
        isLoading: isFetchingThread,
        threadRoot: root,
        currentRoot:
          !!postId && threadData
            ? (threadData.posts.find(
                (post) => post.postId == postId
              ) as PostType)
            : root,
        allPosts: threadData?.posts || [],
        newAnswers: newAnswersArray,
        newAnswersIndex,
        filteredRoot,
        filteredParentChildrenMap,
        categoryFilterState,
        setCategoryFilterState,
      }}
    >
      {children}
    </ThreadContext.Provider>
  );
};

const useThread = () => React.useContext(ThreadContext);

export { ThreadProvider, useThread };
