import {
  CommentType,
  PostType,
  ThreadCommentInfoType,
  ThreadPostInfoType,
  isComment,
  isPost,
} from "types/Types";

import debug from "debug";

const error = debug("bobafrontend:thread-utils-error");
const log = debug("bobafrontend:thread-utils-log");
const info = debug("bobafrontend:thread-utils-info");

export const UNCATEGORIZED_LABEL = "uncategorized";

export const getElementId = (element: PostType | CommentType) => {
  return isPost(element) ? element.postId : element.commentId;
};
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
    total: 0,
    new: 0,
  };
  if (!comments) {
    return result;
  }
  comments.forEach((comment) => {
    result.total++;
    comment.isNew && result.new++;
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

  log(`Created comments tree with ${result.total} comments.`);
  info(result);
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
  postsInfoMap: Map<string, ThreadPostInfoType>;
} => {
  log(`Creating posts tree for thread ${threadId}`);
  if (!posts) {
    return {
      root: null,
      parentChildrenMap: new Map<string, ThreadPostInfoType>(),
      postsInfoMap: new Map<string, ThreadPostInfoType>(),
      postsDisplaySequence: [],
    };
  }
  const root = posts.find((post) => post.parentPostId == null) || null;
  const parentChildrenMap = new Map<string, ThreadPostInfoType>();
  const postsInfoMap = new Map<string, ThreadPostInfoType>();
  const postsDisplaySequence: PostType[] = [];

  // We create a map that for each post returns its tree info.
  posts.forEach((post) => {
    postsInfoMap.set(post.postId, {
      parent:
        posts.find((currentPost) => currentPost.postId == post.parentPostId) ||
        null,
      post: post,
      children: posts.filter(
        (currentPost) => currentPost.parentPostId == post.postId
      ),
    });
  });

  postsInfoMap.forEach((postInfo, key) => {
    if (postInfo.children.length == 0) {
      return;
    }
    parentChildrenMap.set(key, postInfo);
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

  return { root, postsInfoMap, parentChildrenMap, postsDisplaySequence };
};

export const extractNewRepliesSequence = (
  postsDisplaySequence: PostType[],
  postCommentsMap: Map<string, ThreadCommentInfoType>
): (PostType | CommentType)[] => {
  return extractRepliesSequence(postsDisplaySequence, postCommentsMap).filter(
    (reply) => reply.isNew
  );
};

export const extractRepliesSequence = (
  postsDisplaySequence: PostType[],
  postCommentsMap: Map<string, ThreadCommentInfoType>
) => {
  const repliesSequence: (PostType | CommentType)[] = [];
  postsDisplaySequence.forEach((post) => {
    repliesSequence.push(post);
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

    let rollingRoots = [...commentsRoots];
    while (rollingRoots.length > 0) {
      const nextComment = rollingRoots.shift() as CommentType;
      repliesSequence.push(nextComment);
      let replyToId = nextComment.commentId;
      // If the post is part of a chain, the reply will be to the last
      // post in the chain.
      while (commentsChainMap?.has(replyToId)) {
        replyToId = (commentsChainMap.get(replyToId) as CommentType).commentId;
      }
      const replies = commentsChildrenMap.get(replyToId);
      if (replies) {
        rollingRoots = [...replies, ...rollingRoots];
      }
    }
  });

  return repliesSequence;
};

export const getTotalContributions = (
  postId: string,
  postsMap: Map<string, { children: PostType[]; parent: PostType | null }>
) => {
  let total = 0;
  let next = postsMap.get(postId)?.children;
  while (next && next.length > 0) {
    total += next.length;
    next = next.flatMap(
      (child: PostType) => (child && postsMap.get(child.postId)?.children) || []
    );
  }
  return total;
};

export const getTotalNewContributions = (
  postId: string,
  postsMap: Map<string, { children: PostType[]; parent: PostType | null }>
) => {
  let total = 0;
  let next = postsMap.get(postId)?.children;
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
    // Skip root's categories as those are the Board's.
    new Set(
      posts?.flatMap((post) =>
        post.parentPostId ? post.tags.categoryTags : []
      )
    )
  ) as string[];
};

export const extractContentNotices = (posts: PostType[] | undefined) => {
  return Array.from(
    // Skip root's notices as we assume the user willingly clicked.
    new Set(
      posts?.flatMap((post) =>
        post.parentPostId ? post.tags.contentWarnings : []
      )
    )
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

const getGrandParentId = (
  threadElement: PostType | CommentType,
  postsInfoMap: Map<string, ThreadPostInfoType>
) => {
  const parent = isPost(threadElement)
    ? threadElement.parentPostId
    : postsInfoMap.get(threadElement.parentPostId)?.parent?.postId;
  if (!parent) {
    return null;
  }
  return postsInfoMap.get(parent)?.post.parentPostId || null;
};

export const findFirstLevelParent = (
  threadElement: PostType | CommentType,
  postInfoMap: Map<string, ThreadPostInfoType>
) => {
  if (isPost(threadElement) && !threadElement.parentPostId) {
    error("findFirstLevelParent cannot be called on root.");
    return null;
  }
  if (
    isComment(threadElement) &&
    !postInfoMap.get(threadElement.parentPostId)?.parent
  ) {
    log("findFirstLevelParent called on comment that's a child of root.");
    return null;
  }
  let grandParentId: string | null = getGrandParentId(
    threadElement,
    postInfoMap
  );
  let currentPost = isPost(threadElement)
    ? threadElement
    : postInfoMap.get(threadElement.parentPostId)!.post;
  while (grandParentId != null) {
    grandParentId = postInfoMap.get(grandParentId)!.post.parentPostId;
    currentPost = postInfoMap.get(currentPost.parentPostId!)!.post;
  }
  return currentPost;
};

export const findNextSibling = (
  post: PostType,
  postInfoMap: Map<string, ThreadPostInfoType>
) => {
  if (!post.parentPostId) {
    throw new Error("findNextSibling cannot be called on root.");
  }
  const siblings = postInfoMap.get(post.parentPostId)!.children;
  const postIndex = siblings.findIndex(
    (sibling) => sibling.postId == post.postId
  );
  // This was the last sibling.
  if (postIndex == siblings.length - 1) {
    return null;
  }
  return siblings[postIndex + 1];
};

export const findPreviousSibling = (
  post: PostType,
  parentChildrenMap: Map<string, ThreadPostInfoType>
) => {
  if (!post.parentPostId) {
    return null;
  }
  const siblings = parentChildrenMap.get(post.parentPostId)!.children;
  const postIndex = siblings.findIndex(
    (sibling) => sibling.postId == post.postId
  );
  // This was the first sibling.
  if (postIndex == 0) {
    return null;
  }
  return siblings[postIndex - 1];
};
