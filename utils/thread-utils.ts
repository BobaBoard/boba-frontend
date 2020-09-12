import debug from "debug";
import { queryCache } from "react-query";
import {
  PostType,
  CommentType,
  ThreadType,
  BoardActivityResponse,
  ThreadPostInfoType,
  ThreadCommentInfoType,
} from "../types/Types";
const log = debug("bobafrontend:thread-utils-log");
const info = debug("bobafrontend:thread-utils-info");

export const UNCATEGORIZED_LABEL = "uncategorized";
/**
 * Creates a tree representation of the comments in reply to a single post.
 *
 * @param comments A list of all the comments belonging to a post.
 *
 * @returns An object reperesenting the post tree.
 *     - roots: all top-level comments (i.e. direct comments to the post).
 *     - parentChainMap: a commentId->NextCommentInChain map. If a comment is not part
 *          of a chain, its id will not appear in this map.
 *     - parentChildrenMap: a commentId->CommentReplies map. Replies to chains are keyed
 *          by the id of the last post in the chain.
 */
export const makeCommentsTree = (
  comments: CommentType[] | undefined
): ThreadCommentInfoType => {
  const result = {
    roots: [] as CommentType[],
    parentChainMap: new Map<string, CommentType>(),
    parentChildrenMap: new Map<string, CommentType[]>(),
  };
  if (!comments) {
    return result;
  }
  comments.forEach((comment) => {
    if (!comment.parentCommentId && !comment.chainParentId) {
      result.roots.push(comment);
      return;
    }
    // Only the first comment in a chain should appear here
    if (comment.parentCommentId && !comment.chainParentId) {
      result.parentChildrenMap.set(comment.parentCommentId, [
        ...(result.parentChildrenMap.get(comment.parentCommentId) ||
          ([] as CommentType[])),
        comment,
      ]);
    }
    if (comment.chainParentId) {
      result.parentChainMap.set(comment.chainParentId, comment);
    }
  });

  log(`Created comment tree:`);
  log(result);
  return result;
};

// Transform the array of posts received from the server in a tree
// representation. The return value is comprised of two values:
// the root value is the top post of the thread; the parentChildrenMap
// value is a Map from the string id of a post to its direct children.
export const makePostsTree = (
  posts: PostType[] | undefined,
  threadId: string
): {
  root: null | PostType;
  parentChildrenMap: Map<string, ThreadPostInfoType>;
  postsDisplaySequence: PostType[];
} => {
  log(`Creating posts tree for thread ${threadId}`);
  if (!posts) {
    return {
      root: null,
      parentChildrenMap: new Map<string, ThreadPostInfoType>(),
      postsDisplaySequence: [],
    };
  }
  let root: PostType | null = null;
  const parentChildrenMap = new Map<string, ThreadPostInfoType>();
  const postsDisplaySequence: PostType[] = [];

  // We add each post to the "parent children map" for its own parent.
  // Furthermore, we also add the post as a parent for its own parent children map.
  posts.forEach((post) => {
    if (!post.parentPostId) {
      root = post;
      return;
    }
    // TODO: here we're are getting the parent again for every child. just do this
    // once if the parent is not already set.
    const parentPost = posts.find(
      (candidate) => candidate.postId == post.parentPostId
    ) as PostType;
    const grandPost =
      posts.find((candidate) => candidate.postId == parentPost?.parentPostId) ||
      null;
    parentChildrenMap.set(post.parentPostId, {
      parent: grandPost,
      post: parentPost,
      children: [
        ...(parentChildrenMap.get(post.parentPostId)?.children ||
          ([] as PostType[])),
        post,
      ],
    });
  });

  // Creates a ordered sequence of posts like they'd be displayed in a thread
  // (as opposed to by creation time).
  // TODO: extract this to extractAnswerSequence if not needed elsewhere.
  // Maybe needed for post loading?
  if (root) {
    const postsStacks: PostType[] = [root];
    while (postsStacks.length) {
      const currentPost = postsStacks.pop() as PostType;
      postsDisplaySequence.push(currentPost);

      const children = parentChildrenMap.get(currentPost.postId)?.children;
      if (!children) {
        continue;
      }
      for (let i = children.length - 1; i >= 0; i--) {
        postsStacks.push(children[i]);
      }
    }
  }

  return { root, parentChildrenMap, postsDisplaySequence };
};

export const extractAnswersSequence = (
  postsDisplaySequence: PostType[],
  postCommentsMap: Map<string, ThreadCommentInfoType>
): {
  postId?: string;
  commentId?: string;
}[] => {
  const newAnswersSequence = [] as {
    postId?: string;
    commentId?: string;
  }[];
  postsDisplaySequence.forEach((post) => {
    if (post.isNew && post.parentPostId != null) {
      newAnswersSequence.push({ postId: post.postId });
    }
    const {
      roots: commentsRoots,
      parentChainMap: commentsChainMap,
      parentChildrenMap: commentsChildrenMap,
    } = postCommentsMap.get(post.postId) || {
      roots: undefined,
      parentChildrenMap: new Map(),
    };

    if (!commentsRoots) {
      return;
    }

    let newCandidates = [...commentsRoots];
    while (newCandidates.length > 0) {
      const candidate = newCandidates.shift() as CommentType;
      if (candidate.isNew) {
        newAnswersSequence.push({ commentId: candidate.commentId });
      }
      let replyToId = candidate.commentId;
      // If the post is part of a chain, the reply will be to the last
      // post in the chain.
      while (commentsChainMap?.has(replyToId)) {
        replyToId = (commentsChainMap.get(replyToId) as CommentType).commentId;
      }
      const replies = commentsChildrenMap.get(replyToId);
      if (replies) {
        newCandidates = [...replies, ...newCandidates];
      }
    }
  });

  return newAnswersSequence;
};

export const getTotalContributions = (
  post: PostType,
  postsMap: Map<string, { children: PostType[]; parent: PostType | null }>
) => {
  let total = 0;
  let next = postsMap.get(post.postId)?.children;
  while (next && next.length > 0) {
    total += next.length;
    next = next.flatMap(
      (child: PostType) => (child && postsMap.get(child.postId)?.children) || []
    );
  }
  return total;
};

export const getTotalNewContributions = (
  post: PostType,
  postsMap: Map<string, { children: PostType[]; parent: PostType | null }>
) => {
  let total = 0;
  let next = postsMap.get(post.postId)?.children;
  while (next && next.length > 0) {
    total += next.reduce(
      (value: number, post: PostType) => value + (post.isNew ? 1 : 0),
      0
    );
    next = next.flatMap(
      (child: PostType) => (child && postsMap.get(child.postId)?.children) || []
    );
  }
  return total;
};

export const extractCategories = (posts: PostType[] | undefined) => {
  return Array.from(
    new Set(posts?.flatMap((post) => post.tags.categoryTags))
  ) as string[];
};

export const applyCategoriesFilter = (
  root: PostType | null,
  parentChildrenMap: Map<string, ThreadPostInfoType>,
  categoriesFilter: { name: string; active: boolean }[]
) => {
  log(`Applying category filter`);
  if (!root) {
    return {
      root,
      parentChildrenMap,
    };
  }
  const activeCategories = categoriesFilter.filter(
    (category) => category.active
  );
  log(categoriesFilter);
  log(activeCategories);
  // Filter away all posts that don't have children in the category.
  // Root should never be filtered out.
  const resultsMap = new Map<string, boolean>();
  makeActiveChildrenMap(root, parentChildrenMap, activeCategories, resultsMap);
  const newParentChildrenMap = new Map<string, ThreadPostInfoType>();
  parentChildrenMap.forEach((childrenArray, postId) => {
    const activeChildren = childrenArray?.children.filter((child) =>
      resultsMap.get(child.postId)
    );
    if (resultsMap.get(postId) && activeChildren.length > 0) {
      newParentChildrenMap.set(postId, {
        children: activeChildren,
        post: childrenArray.post,
        parent: childrenArray.parent,
      });
    }
  });
  return {
    root,
    parentChildrenMap: newParentChildrenMap,
  };
};

const makeActiveChildrenMap = (
  root: PostType,
  parentChildrenMap: Map<
    string,
    { children: PostType[]; parent: PostType | null }
  >,
  activeCategories: { name: string; active: boolean }[],
  resultsMap: Map<string, boolean>
) => {
  if (resultsMap.has(root.postId)) {
    return resultsMap.get(root.postId) as boolean;
  }
  const children = parentChildrenMap.get(root.postId)?.children;
  if (!children) {
    const hasActiveCategory =
      root.tags.categoryTags &&
      root.tags.categoryTags.some((category) =>
        activeCategories.some(
          (activeCategory) => category == activeCategory.name
        )
      );
    const isUncategorizedAndActive =
      root.tags.categoryTags.length == 0 &&
      activeCategories.some((category) => category.name == UNCATEGORIZED_LABEL);

    const isActive = hasActiveCategory || isUncategorizedAndActive;
    info(activeCategories);
    info(
      `Post with id ${root.postId}'s categories (${root.tags.categoryTags.join(
        ","
      )}) are: ${isActive ? "active" : "not active"}${
        isUncategorizedAndActive ? " (uncategorized)" : ""
      }`
    );
    resultsMap.set(root.postId, hasActiveCategory);
    return isActive;
  }
  let hasCategoryChildren = false;
  children.forEach((child) => {
    const childResult = makeActiveChildrenMap(
      child,
      parentChildrenMap,
      activeCategories,
      resultsMap
    );
    hasCategoryChildren = hasCategoryChildren || childResult;
  });
  resultsMap.set(root.postId, hasCategoryChildren);
  return hasCategoryChildren;
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
  threadData.posts[parentIndex] = {
    ...threadData.posts[parentIndex],
    newCommentsAmount: threadData.posts[parentIndex].newCommentsAmount + 1,
    comments: [
      ...(threadData.posts[parentIndex].comments || []),
      ...newComments,
    ],
  };
  queryCache.setQueryData(["threadData", { threadId }], () => ({
    ...threadData,
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
  threadData.posts = [...threadData.posts, post];
  queryCache.setQueryData(["threadData", { threadId }], () => ({
    ...threadData,
  }));
  return true;
};

export const getThreadInBoardCache = ({
  slug,
  threadId,
}: {
  slug: string;
  threadId: string;
}) => {
  const boardData:
    | BoardActivityResponse[]
    | undefined = queryCache.getQueryData(["boardActivityData", { slug }]);
  if (!boardData) {
    log(`Found no initial board activity data`);
    return undefined;
  }
  log(`Found initial board activity data for board ${slug}`);
  log(boardData);
  const thread = boardData
    .flatMap((data) => data.activity)
    .find((thread) => thread.threadId == threadId);
  if (!thread) {
    return undefined;
  }

  log(`Found thread:`);
  log(thread);
  return { thread, boardData };
};

export const updateThreadReadState = ({
  threadId,
  slug,
}: {
  threadId: string;
  slug: string;
}) => {
  const threadResult = getThreadInBoardCache({ slug, threadId });
  if (threadResult) {
    log(`Found thread in cache:`);
    log(threadResult.thread);
    threadResult.thread.isNew = false;
    threadResult.thread.newCommentsAmount = 0;
    threadResult.thread.newPostsAmount = 0;

    threadResult.thread.posts.forEach((post) => {
      post.isNew = false;
      post.newCommentsAmount = 0;
      post.newPostsAmount = 0;
      post.comments?.forEach((comment) => {
        comment.isNew = false;
      });
    });

    queryCache.setQueryData(
      ["boardActivityData", { slug }],
      threadResult.boardData
    );
  }
};
