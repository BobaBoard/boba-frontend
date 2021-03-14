import { useThreadContext } from "components/thread/ThreadContext";
import React, { SetStateAction } from "react";

import {
  GALLERY_VIEW_MODE,
  THREAD_VIEW_MODES,
  TIMELINE_VIEW_MODE,
  useThreadView,
} from "../thread/useThreadView";
import {
  findFirstLevelParent,
  findNextSibling,
  findPreviousSibling,
} from "../../utils/thread-utils";

import { CommentType, isPost, PostType, ThreadPostInfoType } from "types/Types";
import { getElementId } from "utils/thread-utils";

import debug from "debug";
import { CollapseManager } from "components/thread/useCollapseManager";
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

const useStateWithCallback = <T>(
  initialState: T
): [T, (value: SetStateAction<T>, callback?: (state: T) => void) => void] => {
  const callbackRef = React.useRef<(state: T) => void>(null);
  const [value, setValue] = React.useState(initialState);

  React.useEffect(() => {
    callbackRef.current?.(value);
    // @ts-ignore
    callbackRef.current = null;
  }, [value]);

  const setValueWithCallback = React.useCallback((newValue, callback) => {
    // @ts-ignore
    callbackRef.current = callback;

    return setValue(newValue);
  }, []);

  return [value, setValueWithCallback];
};

const useThreadViewDisplay = () => {
  const { chronologicalPostsSequence, isFetching } = useThreadContext();
  const {
    currentThreadViewMode,
    timelineViewMode,
    galleryViewMode,
  } = useThreadView();

  return React.useMemo(() => {
    if (isFetching) {
      return [];
    }
    switch (currentThreadViewMode) {
      case THREAD_VIEW_MODES.THREAD:
        return chronologicalPostsSequence;
      case THREAD_VIEW_MODES.TIMELINE: {
        switch (timelineViewMode) {
          case TIMELINE_VIEW_MODE.ALL:
            return chronologicalPostsSequence;
          case TIMELINE_VIEW_MODE.LATEST:
            return chronologicalPostsSequence.reverse();
          case TIMELINE_VIEW_MODE.NEW:
            return chronologicalPostsSequence.filter(
              (post) => post.isNew || post.newCommentsAmount > 0
            );
        }
        break;
      }
      case THREAD_VIEW_MODES.MASONRY: {
        const [coverPost, ...allGalleryPosts] = chronologicalPostsSequence;
        switch (galleryViewMode.mode) {
          case GALLERY_VIEW_MODE.ALL:
            return galleryViewMode.showCover
              ? chronologicalPostsSequence
              : allGalleryPosts;
          case GALLERY_VIEW_MODE.NEW: {
            const newPosts = allGalleryPosts.filter(
              (post) => post.isNew || post.newCommentsAmount > 0
            );
            if (galleryViewMode.showCover) {
              newPosts.unshift(coverPost);
            }
            return newPosts;
          }
        }
      }
    }
  }, [
    isFetching,
    timelineViewMode,
    galleryViewMode,
    currentThreadViewMode,
    chronologicalPostsSequence,
  ]);
};

export const READ_MORE_STEP = 5;
export const useDisplayManager = (collapseManager: CollapseManager) => {
  const currentModeDisplayElements = useThreadViewDisplay();
  const { currentThreadViewMode } = useThreadView();
  const { postsInfoMap } = useThreadContext();
  /**
   * How many contributions are currently displayed (at most) in the current mode.
   * Automatically reset when view changes. Also automatically increased in case of
   * staggered loading for long threads.
   * Can't be more than max length of current contributions.
   * TODO: check the last statement is true.
   */
  const [maxDisplay, setMaxDisplay] = useStateWithCallback(READ_MORE_STEP);
  const { isFetching } = useThreadContext();

  React.useEffect(() => {
    setMaxDisplay(READ_MORE_STEP);
  }, [currentModeDisplayElements, setMaxDisplay]);

  const displayMore = React.useCallback(
    (callback: (newMax: number, hasMore: boolean) => void) => {
      setMaxDisplay(
        (maxDisplay) =>
          Math.min(
            maxDisplay + READ_MORE_STEP,
            currentModeDisplayElements.length
          ),
        (newValue) => {
          log(
            `New total posts loaded: ${newValue}. Total posts: ${currentModeDisplayElements.length}`
          );
          callback(newValue, newValue <= currentModeDisplayElements.length);
        }
      );
    },
    [setMaxDisplay, currentModeDisplayElements]
  );

  React.useEffect(() => {
    if (isFetching || currentThreadViewMode != THREAD_VIEW_MODES.THREAD) {
      return;
    }
    let id: number;
    let timeout: NodeJS.Timeout;
    const idleCallback = () => {
      log(`Browser idle (or equivalent). Loading more.....`);
      requestAnimationFrame(() =>
        displayMore((newValue, hasMore) => {
          if (hasMore) {
            timeout = setTimeout(() => {
              log(`Creating request for further load at next idle step.`);
              // @ts-ignore
              id = requestIdleCallback(idleCallback /*, { timeout: 2000 }*/);
            }, 5000);
          }
        })
      );
    };
    // @ts-ignore
    requestIdleCallback(idleCallback /*, { timeout: 500 }*/);
    return () => {
      if (id) {
        // @ts-ignore
        cancelIdleCallback(id);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isFetching, currentThreadViewMode, displayMore]);

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
              ? elementIndex + (READ_MORE_STEP - 1)
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
