import {
  CommentType,
  PostType,
  ThreadCommentInfoType,
  ThreadPostInfoType,
  ThreadType,
} from "types/Types";
import { THREAD_QUERY_KEY, useThread } from "queries/thread";
import {
  extractCategories,
  extractContentNotices,
  extractNewRepliesSequence,
  extractRepliesSequence,
  getCommentFromId,
  makeCommentsTree,
  makePostsTree,
} from "utils/thread-utils";

import React from "react";
import { compareAsc as compareDatesAsc } from "date-fns";
import debug from "debug";
import { useQueryClient } from "react-query";

const log = debug("bobafrontend:ThreadContext-log");
const info = debug("bobafrontend:ThreadContext-info");

export interface ThreadContextType {
  isLoading: boolean;
  isRefetching: boolean;
  isFetching: boolean;
  defaultView: ThreadType["defaultView"] | null;
  // The root of the thread (a.k.a. the first post).
  threadRoot: PostType | null;
  // The current post targeted by the page.
  currentRoot: PostType | null;
  chronologicalPostsSequence: PostType[];
  threadDisplaySequence: (PostType | CommentType)[];
  newRepliesSequence: (PostType | CommentType)[];
  parentChildrenMap: Map<string, ThreadPostInfoType>;
  postsInfoMap: Map<string, ThreadPostInfoType>;
  /**
   * A map from the id of a post to the data of its comments.
   */
  postCommentsMap: Map<string, ThreadCommentInfoType>;
  categories: string[];
  contentNotices: string[];
  hasNewReplies: boolean;
  newRepliesCount: number;
  opIdentity?: {
    name: string;
    avatar: string;
  };
  personalIdentity?: {
    name: string;
    avatar: string;
  };
  parentBoardSlug: string | null;
  threadId: string | null;
  muted: boolean | undefined;
  hidden: boolean | undefined;
}

const ThreadContext = React.createContext<ThreadContextType | null>(null);

export const useThreadContext = () => {
  const context = React.useContext<ThreadContextType | null>(ThreadContext);

  if (!context) {
    throw new Error("ThreadContext should be used within a context provider.");
  }

  return context;
};

const ThreadContextProvider: React.FC<{
  commentId: string | null;
  boardId: string | null;
  threadId: string;
  postId: string | null;
  children?: React.ReactNode;
}> = (props) => {
  log(
    `Rendering thread context for thread ${props.threadId} and post ${props.postId}`
  );
  const value = useThreadWithNull({
    boardId: props.boardId,
    threadId: props.threadId,
    postId: props.postId,
    commentId: props.commentId,
    fetch: true,
  });

  return (
    <ThreadContext.Provider value={value}>
      {props.children}
    </ThreadContext.Provider>
  );
};

export default ThreadContextProvider;

export const useThreadMetadata = ({
  threadData,
  postId,
  commentId,
}: {
  postId?: string | null;
  commentId?: string | null;
  threadData?: ThreadType | null;
}) => {
  const threadId = threadData?.id;
  const {
    root,
    parentChildrenMap,
    newRepliesSequence,
    postCommentsMap,
    postsInfoMap,
    chronologicalPostsSequence,
    threadDisplaySequence,
  } = React.useMemo(() => {
    log(`Building posts tree for thread ${threadId}`);
    info("Thread data:", threadData);
    const {
      root = null,
      parentChildrenMap = new Map(),
      postsInfoMap = new Map(),
      postsDisplaySequence = [],
    } = threadId ? makePostsTree(threadData?.posts, threadId) : {};
    const postCommentsMap = new Map<string, ThreadCommentInfoType>();
    if (threadData?.comments) {
      Object.entries(threadData?.comments).forEach(([postId, comments]) => {
        postCommentsMap.set(postId, makeCommentsTree(comments));
      });
    }

    const chronologicalPostsSequence =
      threadData?.posts.sort((post1, post2) =>
        compareDatesAsc(new Date(post1.created), new Date(post2.created))
      ) || [];

    const threadDisplaySequence = postsDisplaySequence
      ? extractRepliesSequence(postsDisplaySequence, postCommentsMap)
      : [];

    return {
      root,
      parentChildrenMap,
      postsInfoMap,
      postCommentsMap,
      chronologicalPostsSequence,
      threadDisplaySequence,
      newRepliesSequence: postsDisplaySequence
        ? extractNewRepliesSequence(postsDisplaySequence, postCommentsMap)
        : [],
    };
  }, [threadData, threadId]);

  let currentRoot = root;
  if (postId && threadData) {
    currentRoot =
      threadData.posts.find((post) => post.postId == postId) ?? null;
  }

  if (commentId && threadData) {
    const comment = getCommentFromId({
      commentId,
      threadComments: threadData.comments,
    });

    currentRoot =
      threadData.posts.find((post) => post.postId == comment?.parentPostId) ??
      null;
    console.log(currentRoot);
  }

  return {
    threadRoot: root,
    currentRoot,
    newRepliesSequence,
    postsInfoMap,
    threadDisplaySequence,
    parentChildrenMap,
    categories: React.useMemo(
      () => extractCategories(threadData?.posts),
      [threadData?.posts]
    ),
    contentNotices: React.useMemo(
      () => extractContentNotices(threadData?.posts),
      [threadData?.posts]
    ),
    postCommentsMap,
    chronologicalPostsSequence,
    defaultView: threadData?.defaultView || null,
    personalIdentity: threadData?.personalIdentity,
    opIdentity: threadData?.starter?.secretIdentity,
    hasNewReplies: !!newRepliesSequence.length,
    newRepliesCount: newRepliesSequence.length,
    parentBoardSlug: threadData?.parentBoardSlug || null,
    threadId: threadId,
    muted: threadData?.muted,
    hidden: threadData?.hidden,
  };
};

export const useThreadWithNull = ({
  threadId,
  postId,
  commentId,
  boardId,
  fetch,
}: {
  threadId: string | null;
  postId: string | null;
  commentId: string | null;
  boardId: string | null;
  fetch?: boolean;
}): ThreadContextType => {
  const {
    data: threadData,
    isLoading: isFetchingThread,
    isFetching: isRefetching,
  } = useThread({
    threadId,
    boardId,
    fetch,
  });
  const threadMetadata = useThreadMetadata({ threadData, postId, commentId });

  return {
    isLoading: isFetchingThread,
    isFetching: isFetchingThread || isRefetching,
    isRefetching: isRefetching,
    ...threadMetadata,
    threadId,
  };
};

export const useInvalidateThreadData = () => {
  const queryClient = useQueryClient();
  return ({ threadId }: { threadId: string }) =>
    queryClient.invalidateQueries([THREAD_QUERY_KEY, { threadId }], {
      exact: false,
    });
};
