import { useThreadContext } from "components/thread/ThreadContext";
import React, { SetStateAction } from "react";

import {
  GALLERY_VIEW_MODE,
  THREAD_VIEW_MODES,
  TIMELINE_VIEW_MODE,
  useThreadView,
} from "../thread/useThreadView";

import debug from "debug";
import { CommentType, PostType } from "types/Types";
import { getElementId } from "utils/thread-utils";
const log = debug("bobafrontend:useDisplayManager-log");
const info = debug("bobafrontend:useDisplayManager-info");

const useStateWithCallback = <T extends any>(
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

const READ_MORE_STEP = 5;
export const useDisplayManager = (currentThreadViewMode: THREAD_VIEW_MODES) => {
  const currentModeDisplayElements = useThreadViewDisplay();
  const [maxDisplay, setMaxDisplay] = useStateWithCallback(READ_MORE_STEP);
  const { isFetching } = useThreadContext();

  React.useEffect(() => {
    setMaxDisplay(READ_MORE_STEP);
  }, [currentThreadViewMode, setMaxDisplay]);

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
      const elementIndex = currentModeDisplayElements.findIndex(
        (element) => getElementId(element) === getElementId(threadElement)
      );
      setMaxDisplay(
        (maxDisplay) =>
          elementIndex > maxDisplay ? elementIndex + 1 : maxDisplay,
        () => {
          callback?.();
        }
      );
    },
    [setMaxDisplay, currentModeDisplayElements]
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
