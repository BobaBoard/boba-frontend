import {
  CommentType,
  PostType,
  ThreadCommentInfoType,
  ThreadPostInfoType,
  isPost,
} from "types/Types";
import {
  GALLERY_VIEW_SUB_MODE,
  THREAD_VIEW_MODE,
  TIMELINE_VIEW_SUB_MODE,
  ThreadViewMode,
  useThreadViewContext,
} from "contexts/ThreadViewContext";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import {
  UNCATEGORIZED_LABEL,
  findFirstLevelParent,
  findNextSibling,
  findPreviousSibling,
} from "utils/thread-utils";
import {
  useActiveCategories,
  useFilterableContext,
} from "components/core/feeds/FilterableContext";

import { CollapseManager } from "components/thread/useCollapseManager";
import React from "react";
import debug from "debug";
import { getElementId } from "utils/thread-utils";
import { useStateWithCallback } from "components/hooks/useStateWithCallback";
import { useThreadContext } from "components/thread/ThreadContext";

const error = debug("bobafrontend:useDisplayManager-error");
const log = debug("bobafrontend:useDisplayManager-log");
const info = debug("bobafrontend:useDisplayManager-info");

const maybeCollapseToElement = ({
  targetElement,
  lastCurrentlyDisplayed,
  postsInfoMap,
  collapseManager,
}: {
  targetElement: PostType | CommentType;
  lastCurrentlyDisplayed: PostType | CommentType;
  postsInfoMap: Map<string, ThreadPostInfoType>;
  collapseManager: CollapseManager;
}) => {
  const lastVisibleElementFirstLevelParent = findFirstLevelParent(
    lastCurrentlyDisplayed,
    postsInfoMap
  );

  const firstCollapsedLvl1 = lastVisibleElementFirstLevelParent
    ? findNextSibling(lastVisibleElementFirstLevelParent, postsInfoMap)
    : // In case there's no visible first level parent contribution (e.g. because the only
      // displayed elements are comment replies to the thread root), we start from the first
      // children of root.
      Array.from(postsInfoMap.values()).find((postInfo) => !postInfo.parent)
        ?.children[0];

  const newElementFirstLevelParent = findFirstLevelParent(
    targetElement,
    postsInfoMap
  );
  const lastCollapsedLvl1 = newElementFirstLevelParent
    ? findPreviousSibling(newElementFirstLevelParent, postsInfoMap)
    : null;

  if (!firstCollapsedLvl1 || !lastCollapsedLvl1) {
    error(
      `Couldn't find outer limits of posts to collapse: (${firstCollapsedLvl1}, ${lastCollapsedLvl1})`
    );
    return;
  }
  log(
    `Adding collapse group: [${firstCollapsedLvl1!.postId}, ${
      lastCollapsedLvl1!.postId
    }]`
  );
  const collapseGroupId = collapseManager.addCollapseGroup(
    firstCollapsedLvl1!.postId,
    lastCollapsedLvl1!.postId
  );
  collapseManager.onCollapseLevel(collapseGroupId);
};

const getDisplayPostsForView = (
  chronologicalPostsSequence: PostType[],
  postCommentsMap: Map<string, ThreadCommentInfoType>,
  viewMode: {
    currentThreadViewMode: THREAD_VIEW_MODE;
    timelineViewMode: TIMELINE_VIEW_SUB_MODE;
    galleryViewMode: ThreadViewMode["galleryViewMode"];
  }
) => {
  switch (viewMode.currentThreadViewMode) {
    case THREAD_VIEW_MODE.THREAD:
      return chronologicalPostsSequence;
    case THREAD_VIEW_MODE.TIMELINE: {
      switch (viewMode.timelineViewMode) {
        case TIMELINE_VIEW_SUB_MODE.ALL:
          return chronologicalPostsSequence;
        case TIMELINE_VIEW_SUB_MODE.LATEST:
          return [...chronologicalPostsSequence].reverse();
        case TIMELINE_VIEW_SUB_MODE.NEW:
          return chronologicalPostsSequence.filter(
            (post) => post.isNew || !!postCommentsMap.get(post.postId)?.new
          );
      }
      break;
    }
    case THREAD_VIEW_MODE.MASONRY: {
      const [coverPost, ...allGalleryPosts] = chronologicalPostsSequence;
      switch (viewMode.galleryViewMode!.mode) {
        case GALLERY_VIEW_SUB_MODE.ALL:
          return viewMode.galleryViewMode!.showCover
            ? chronologicalPostsSequence
            : allGalleryPosts;
        case GALLERY_VIEW_SUB_MODE.NEW: {
          const newPosts = allGalleryPosts.filter(
            (post) => post.isNew || !!postCommentsMap.get(post.postId)?.new
          );
          if (viewMode.galleryViewMode!.showCover) {
            newPosts.unshift(coverPost);
          }
          return newPosts;
        }
      }
      break;
    }
    default:
      throw new Error(`Unknown view mode: ${viewMode.currentThreadViewMode}`);
  }
};

const useThreadViewDisplay = () => {
  const { chronologicalPostsSequence, postCommentsMap, postsInfoMap } =
    useThreadContext();
  const { currentThreadViewMode, timelineViewMode, galleryViewMode } =
    useThreadViewContext();
  const { activeCategories, filteredNotices } = useFilterableContext();
  const { postId } = usePageDetails<ThreadPageDetails>();

  return React.useMemo(() => {
    if (!chronologicalPostsSequence) {
      return [];
    }
    const displayPostsForView = getDisplayPostsForView(
      chronologicalPostsSequence,
      postCommentsMap,
      {
        currentThreadViewMode: !postId
          ? currentThreadViewMode
          : THREAD_VIEW_MODE.THREAD,
        timelineViewMode,
        galleryViewMode,
      }
    );

    if (filteredNotices.length > 0 || activeCategories.length > 0) {
      const finalDisplayPosts: PostType[] = [];

      displayPostsForView.forEach((post) => {
        if (
          post.tags.contentWarnings.some((tag) =>
            filteredNotices?.includes(tag)
          )
        ) {
          return;
        }
        if (activeCategories.length == 0) {
          finalDisplayPosts.push(post);
        } else if (
          activeCategories.includes(UNCATEGORIZED_LABEL) &&
          post.tags.categoryTags.length === 0
        ) {
          finalDisplayPosts.push(post);
        } else if (
          post.tags.categoryTags.some((tag) => !!activeCategories.includes(tag))
        ) {
          finalDisplayPosts.push(post);
        }
      });

      if (currentThreadViewMode == THREAD_VIEW_MODE.MASONRY) {
        return finalDisplayPosts;
      }
      // Remove any posts whose ancestors include filtered cn's
      const filteredFinalDisplayPosts: PostType[] = [];
      finalDisplayPosts.forEach((post) => {
        let parentId = post.parentPostId;
        while (parentId != null) {
          const parentData = postsInfoMap.get(parentId)!;
          if (
            parentData.post.tags.contentWarnings.some((tag) =>
              filteredNotices?.includes(tag)
            )
          ) {
            // Error found! Stop the loop early.
            break;
          }
          parentId = parentData.parent?.postId || null;
        }
        if (parentId == null) {
          // We've traversed the whole parent chain without error, so
          // we can add the post to the final display.
          filteredFinalDisplayPosts.push(post);
        }
      });
      if (currentThreadViewMode == THREAD_VIEW_MODE.TIMELINE) {
        return filteredFinalDisplayPosts;
      }
      // Add all parents of posts, even if they don't have categories.
      const displayPostsWithParents = [...filteredFinalDisplayPosts];
      filteredFinalDisplayPosts.forEach((post) => {
        let parent = post.parentPostId;
        while (parent != null) {
          const parentData = postsInfoMap.get(parent)!;
          displayPostsWithParents.push(parentData.post);
          parent = parentData.parent?.postId || null;
        }
      });

      return chronologicalPostsSequence.filter((post) =>
        displayPostsWithParents.includes(post)
      );
    }

    return displayPostsForView;
  }, [
    timelineViewMode,
    galleryViewMode,
    currentThreadViewMode,
    chronologicalPostsSequence,
    activeCategories,
    postsInfoMap,
    postId,
    filteredNotices,
    postCommentsMap,
  ]);
};

export const FIRST_LOAD = 5;
export const READ_MORE_STEP = 5;
/**
 * Note: changes to optional loading amount won't be honored after mount.
 */
export const useDisplayManager = (
  collapseManager: CollapseManager,
  {
    firstLoadAmount,
    loadMoreAmount,
  }: { firstLoadAmount: number; loadMoreAmount: number } = {
    firstLoadAmount: FIRST_LOAD,
    loadMoreAmount: READ_MORE_STEP,
  }
) => {
  const currentModeDisplayElements = useThreadViewDisplay();
  const { currentThreadViewMode } = useThreadViewContext();
  const activeCategories = useActiveCategories();
  const { postsInfoMap, isFetching } = useThreadContext();
  /**
   * How many contributions are currently displayed (at most) in the current mode.
   * Automatically reset when view changes. Also automatically increased in case of
   * staggered loading for long threads.
   * Can't be more than max length of current contributions.
   * TODO: check the last statement is true.
   */
  const [maxDisplay, setMaxDisplay] = useStateWithCallback(firstLoadAmount);
  const loadMoreIdleCallback = React.useRef<number | null>(null);
  // These are stored in a ref to prevent changing them after the first render.
  const loadMoreAmountRef = React.useRef(loadMoreAmount);
  const firstLoadAmountRef = React.useRef(firstLoadAmount);

  React.useEffect(() => {
    setMaxDisplay(firstLoadAmountRef.current);
  }, [currentThreadViewMode, setMaxDisplay]);

  const displayMore = React.useCallback(
    (callback: (newMax: number, hasMore: boolean) => void) => {
      log("Potentially increasing the amount of displayed posts...");
      setMaxDisplay(
        (maxDisplay) =>
          Math.min(
            maxDisplay + loadMoreAmountRef.current,
            isFetching ? maxDisplay : currentModeDisplayElements.length
          ),
        (newValue) => {
          log(
            `New total posts loaded: ${newValue}. Total posts: ${currentModeDisplayElements.length}`
          );
          const hasMore = newValue < currentModeDisplayElements.length;
          if (!hasMore && loadMoreIdleCallback.current) {
            log("Clearing load more idle callback");
            cancelIdleCallback(loadMoreIdleCallback.current);
          }
          callback(newValue, newValue < currentModeDisplayElements.length);
        }
      );
    },
    [setMaxDisplay, currentModeDisplayElements, isFetching]
  );

  React.useEffect(() => {
    if (isFetching || currentThreadViewMode != THREAD_VIEW_MODE.THREAD) {
      return;
    }
    const idleCallback = () => {
      log(`Browser idle (or equivalent). Loading more.....`);
      requestAnimationFrame(() =>
        displayMore((newValue, hasMore) => {
          if (hasMore) {
            log(`Creating request for further load at next idle step.`);
            loadMoreIdleCallback.current = requestIdleCallback(idleCallback, {
              timeout: 1000,
            });
          }
        })
      );
    };
    loadMoreIdleCallback.current = requestIdleCallback(idleCallback);
    return () => {
      if (loadMoreIdleCallback.current) {
        cancelIdleCallback(loadMoreIdleCallback.current);
      }
    };
  }, [isFetching, currentThreadViewMode, displayMore, activeCategories]);

  const hasMore = React.useCallback(() => {
    return maxDisplay < currentModeDisplayElements.length;
  }, [maxDisplay, currentModeDisplayElements]);

  const displayToThreadElement = React.useCallback(
    (threadElement: PostType | CommentType, callback?: () => void) => {
      const showUpToPostId = isPost(threadElement)
        ? threadElement.postId
        : threadElement.parentPostId;
      const elementIndex = currentModeDisplayElements.findIndex(
        (element) => getElementId(element) === showUpToPostId
      );
      setMaxDisplay(
        (maxDisplay) => {
          const newMaxDisplay = Math.min(
            elementIndex > maxDisplay
              ? elementIndex + (loadMoreAmountRef.current - 1)
              : maxDisplay,
            currentModeDisplayElements.length
          );
          if (newMaxDisplay != maxDisplay) {
            // If the target element is further ahead than what's currently displayed, collapse the posts
            // inbetween the two, so we don't need to wait for them all to load.
            const lastCurrentlyDisplayedIndex = Math.min(
              maxDisplay,
              currentModeDisplayElements.length - 1
            );
            if (elementIndex > lastCurrentlyDisplayedIndex) {
              const lastCurrentlyDisplayed =
                currentModeDisplayElements[lastCurrentlyDisplayedIndex];
              info(`The last post displayed is: ${lastCurrentlyDisplayed}`);
              maybeCollapseToElement({
                targetElement: threadElement,
                postsInfoMap,
                lastCurrentlyDisplayed,
                collapseManager,
              });
            }
          } else {
            callback?.();
          }

          return newMaxDisplay;
        },
        () => {
          requestAnimationFrame(() => callback?.());
        }
      );
    },
    [setMaxDisplay, currentModeDisplayElements, collapseManager, postsInfoMap]
  );

  return React.useMemo(
    () => ({
      currentModeDisplayElements,
      currentModeLoadedElements: currentModeDisplayElements.filter(
        (_, index) => index < maxDisplay
      ),
      displayToThreadElement,
      maxDisplay,
      hasMore,
      displayMore,
    }),
    [
      currentModeDisplayElements,
      displayToThreadElement,
      maxDisplay,
      hasMore,
      displayMore,
    ]
  );
};

export type DisplayManager = ReturnType<typeof useDisplayManager>;
