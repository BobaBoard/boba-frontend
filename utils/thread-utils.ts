import debug from "debug";
import {
  PostType,
  CommentType,
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

  // We add each post to the "parent children map" for its own parent, thereby constructing
  // the "three map" of the thread.
  // posts.forEach((post) => {
  //   // Our post tree skips the root. The first level of the tree is simply all the entries
  //   // of the top Map.
  //   if (!post.parentPostId) {
  //     return;
  //   }
  //   // TODO: here we're are getting the parent again for every child. just do this
  //   // once if the parent is not already set.
  //   const parentPost = posts.find(
  //     (candidate) => candidate.postId == post.parentPostId
  //   ) as PostType;
  //   const grandPost =
  //     posts.find((candidate) => candidate.postId == parentPost?.parentPostId) ||
  //     null;
  //   parentChildrenMap.set(post.parentPostId, {
  //     parent: grandPost,
  //     post: parentPost,
  //     children: [
  //       ...(parentChildrenMap.get(post.parentPostId)?.children ||
  //         ([] as PostType[])),
  //       post,
  //     ],
  //   });
  // });
  postsInfoMap.forEach((postInfo, key) => {
    console.log(postInfo);
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

export const findFirstLevelParent = (
  post: PostType,
  parentChildrenMap: Map<string, ThreadPostInfoType>
) => {
  let lastRootId = post.parentPostId;
  let lastFirstChildLoaded = post;
  while (lastRootId != null) {
    lastRootId = parentChildrenMap.get(lastRootId)!.post.parentPostId;
    lastFirstChildLoaded = parentChildrenMap.get(
      lastFirstChildLoaded.parentPostId!
    )!.post;
  }
  return lastFirstChildLoaded;
};

export const findNextSibling = (
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
