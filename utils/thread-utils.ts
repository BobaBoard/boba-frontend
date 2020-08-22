import debug from "debug";
import { PostType, CommentType } from "../types/Types";
const log = debug("bobafrontend:thread-utils");

export const makeCommentsTree = (
  comments: CommentType[] | undefined,
  parentCommentId: string | null,
  postId: string
) => {
  log(`Creating comments tree for post ${postId}`);
  const result = {
    roots: [] as CommentType[],
    parentChainMap: new Map<string, CommentType>(),
    parentChildrenMap: new Map<string, CommentType[]>(),
  };
  if (!comments) {
    return result;
  }
  comments.forEach((comment) => {
    if (comment.parentCommentId == parentCommentId && !comment.chainParentId) {
      result.roots.push(comment);
      return;
    }
    if (comment.parentCommentId) {
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
  parentChildrenMap: Map<string, PostType[]>;
  postsDisplaySequence: null | PostType[];
} => {
  log(`Creating posts tree for thread ${threadId}`);
  if (!posts) {
    return {
      root: null,
      parentChildrenMap: new Map<string, PostType[]>(),
      postsDisplaySequence: null,
    };
  }
  let root: PostType | null = null;
  const parentChildrenMap = new Map<string, PostType[]>();
  const postsDisplaySequence: PostType[] = [];

  posts.forEach((post) => {
    if (!post.parentPostId) {
      root = post;
      return;
    }
    parentChildrenMap.set(post.parentPostId, [
      ...(parentChildrenMap.get(post.parentPostId) || ([] as PostType[])),
      post,
    ]);
  });

  if (root) {
    const postsStacks: PostType[] = [root];
    while (postsStacks.length) {
      const currentPost = postsStacks.pop() as PostType;
      postsDisplaySequence.push(currentPost);

      const children = parentChildrenMap.get(currentPost.postId);
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

export const getTotalContributions = (
  post: PostType,
  postsMap: Map<string, PostType[]>
) => {
  let total = 0;
  let next = postsMap.get(post.postId);
  while (next && next.length > 0) {
    total += next.length;
    next = next.flatMap(
      (child: PostType) => (child && postsMap.get(child.postId)) || []
    );
  }
  return total;
};

export const getTotalNewContributions = (
  post: PostType,
  postsMap: Map<string, PostType[]>
) => {
  let total = 0;
  let next = postsMap.get(post.postId);
  while (next && next.length > 0) {
    total += next.reduce(
      (value: number, post: PostType) => value + (post.isNew ? 1 : 0),
      0
    );
    next = next.flatMap(
      (child: PostType) => (child && postsMap.get(child.postId)) || []
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
  parentChildrenMap: Map<string, PostType[]>,
  categoriesFilter: { name: string; active: boolean }[]
) => {
  const activeCategories = categoriesFilter.filter(
    (category) => category.active
  );
  if (!root || activeCategories.length == categoriesFilter.length) {
    // All categories are active, don't filter
    return {
      root,
      parentChildrenMap,
    };
  }
  // Filter away all posts that don't have children in the category.
  // Root should never be filtered out.
  debugger;
  const resultsMap = new Map<string, boolean>();
  makeActiveChildrenMap(root, parentChildrenMap, activeCategories, resultsMap);
  const newParentChildrenMap = new Map<string, PostType[]>();
  parentChildrenMap.forEach((childrenArray, postId) => {
    const activeChildren = childrenArray.filter((child) =>
      resultsMap.get(child.postId)
    );
    if (resultsMap.get(postId) && activeChildren.length > 0) {
      newParentChildrenMap.set(postId, activeChildren);
    }
  });
  return {
    root,
    parentChildrenMap: newParentChildrenMap,
  };
};

const makeActiveChildrenMap = (
  root: PostType,
  parentChildrenMap: Map<string, PostType[]>,
  activeCategories: { name: string; active: boolean }[],
  resultsMap: Map<string, boolean>
) => {
  if (resultsMap.has(root.postId)) {
    return resultsMap.get(root.postId) as boolean;
  }
  const children = parentChildrenMap.get(root.postId);
  if (!children) {
    const hasActiveCategory =
      root.tags.categoryTags &&
      root.tags.categoryTags.some((category) =>
        activeCategories.some(
          (activeCategory) => category == activeCategory.name
        )
      );
    resultsMap.set(root.postId, hasActiveCategory);
    return hasActiveCategory;
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
