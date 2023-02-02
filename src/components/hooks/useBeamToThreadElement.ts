import {
  CommentType,
  PostType,
  ThreadSummaryType,
  isComment,
  isPost,
} from "types/Types";
import {
  GALLERY_VIEW_SUB_MODE,
  THREAD_VIEW_MODE,
  TIMELINE_VIEW_SUB_MODE,
  useThreadViewContext,
} from "contexts/ThreadViewContext";
import { isScrolledPast, tryScrollToElement } from "utils/scroll-utils";

import { DisplayManager } from "./useDisplayMananger";
import React from "react";
import debug from "debug";
import { extractRepliesSequence } from "utils/thread-utils";
import { useStateWithCallback } from "./useStateWithCallback";
import { useThreadContext } from "../thread/ThreadContext";

// const error = debug("bobafrontend:useBeamToElement-error");
const log = debug("bobafrontend:useBeamToThreadElement-log");
const info = debug("bobafrontend:useBeamToThreadElement-info");

/**
 * Gets the next element after the current index that we have NOT scrolled past.
 * If we scrolled past them all, start again from the beginning.
 */
export const getNextElementInViewIndex = ({
  currentIndex,
  elementsSequence,
}: {
  currentIndex: number;
  elementsSequence: (PostType | CommentType | ThreadSummaryType)[];
}) => {
  let nextIndex = (currentIndex + 1) % elementsSequence.length;
  let next = elementsSequence[nextIndex];
  // Keep trying to go to the next element until we find one that is either
  // below the fold, or we find that none are. In that case, we should start
  // back again from the first element (unless the first element is the thread
  // starter and skipThreadStarter is true).
  while (
    isScrolledPast({
      threadElement: next,
    })
  ) {
    nextIndex = (nextIndex + 1) % elementsSequence.length;
    if (nextIndex < currentIndex) {
      // We've gone back to the beginning, return directly.
      return 0;
    }
    next = elementsSequence[nextIndex];
  }
  return nextIndex;
};

/**
 * Returns the current sequence of posts to beam through according to the view mode
 * of the thread the user is currently in.
 *
 * Note: this should not be used outside of the a thread page.
 */
// TODO: this doesn't handle the case where comment threads may have been "collapsed"
export const useCurrentThreadDisplaySequence = () => {
  const { currentThreadViewMode, galleryViewMode, timelineViewMode } =
    useThreadViewContext();
  const {
    chronologicalPostsSequence,
    threadDisplaySequence,
    newRepliesSequence,
    postCommentsMap,
    threadRoot,
  } = useThreadContext();

  switch (currentThreadViewMode) {
    case THREAD_VIEW_MODE.THREAD: {
      const newOnly = newRepliesSequence.length > 0;
      const sequence = newOnly ? newRepliesSequence : threadDisplaySequence;

      const hasThreadStarter =
        sequence?.[0] &&
        isPost(sequence[0]) &&
        sequence[0].parentPostId == null;

      // Remove the thread starter from the array for thread view
      return hasThreadStarter ? sequence.slice(1) : sequence;
    }
    case THREAD_VIEW_MODE.TIMELINE: {
      if (timelineViewMode == TIMELINE_VIEW_SUB_MODE.NEW) {
        return newRepliesSequence;
      }
      return timelineViewMode == TIMELINE_VIEW_SUB_MODE.LATEST
        ? extractRepliesSequence(
            [...chronologicalPostsSequence].reverse(),
            postCommentsMap
          )
        : extractRepliesSequence(chronologicalPostsSequence, postCommentsMap);
    }
    case THREAD_VIEW_MODE.MASONRY: {
      const sequence =
        galleryViewMode.mode == GALLERY_VIEW_SUB_MODE.NEW
          ? newRepliesSequence
          : chronologicalPostsSequence;
      if (galleryViewMode.showCover) {
        return sequence;
      }
      // We're not displaying the gallery cover (thread starter), so we should remove
      // it (and all its replies) from the sequence.
      let sequenceWithHiddenCover = [...sequence];
      while (threadRoot && sequenceWithHiddenCover.length > 0) {
        const threadRootPostId = threadRoot.postId;
        const currentElement = sequenceWithHiddenCover[0];
        // We start from the beginning, and for as long as we keep getting first elements
        // that match our criteria for "skippable "
        if (
          (isPost(currentElement) &&
            currentElement.postId == threadRootPostId) ||
          (isComment(currentElement) &&
            currentElement.parentPostId == threadRoot.postId)
        ) {
          sequenceWithHiddenCover = sequenceWithHiddenCover.slice(1);
        } else {
          break;
        }
      }
      return sequenceWithHiddenCover;
    }
  }
};

export const useBeamToThreadElement = (
  displayManager: DisplayManager,
  accentColor: string | undefined
) => {
  const [currentIndex, setCurrentIndex] = React.useState(-1);
  const threadContext = useThreadContext();
  const [loadingMore, setLoadingMore] = useStateWithCallback(false);

  const { isFetching } = threadContext;
  const elementsSequence = useCurrentThreadDisplaySequence();

  const { currentThreadViewMode, galleryViewMode, timelineViewMode } =
    useThreadViewContext();

  React.useEffect(() => {
    // When the view mode changes, reset the sequence index.
    setCurrentIndex(-1);
  }, [currentThreadViewMode, galleryViewMode, timelineViewMode]);

  const canBeamToNext = elementsSequence.length > 0;
  const onBeamToNext = React.useCallback(() => {
    if (isFetching || !canBeamToNext) {
      return;
    }

    log(`Finding next element...`);
    // TODO: we may need to be more lenient with this when it comes to gallery, cause scrolling through comments
    // will often cause the next post to go past the viewport, and then we end up completely skipping it.
    // Hard to know what the right thing to do in gallery mode is though, it requires more thought.
    setCurrentIndex((currentIndex) => {
      const nextIndex = getNextElementInViewIndex({
        currentIndex: currentIndex,
        elementsSequence: elementsSequence,
      });
      const next = elementsSequence[nextIndex];
      info(elementsSequence);
      setLoadingMore(true, () => {
        displayManager.displayToThreadElement(next, () => {
          tryScrollToElement(next, accentColor);
          setLoadingMore(false);
        });
      });
      return nextIndex;
    });
  }, [
    accentColor,
    canBeamToNext,
    displayManager,
    isFetching,
    setLoadingMore,
    elementsSequence,
  ]);

  // A thread can always beam to previous because we always have the full thread loaded and ready,
  // (or can trigger a quick render as needed), but we don't have a way to jump to the last page
  // of timeline or gallery mode as of now, which means we only jump up if we're already past the
  // root.
  const canBeamToPrevious =
    elementsSequence.length > 0 &&
    (currentThreadViewMode == THREAD_VIEW_MODE.THREAD || currentIndex > 0);
  const onBeamToPrevious = React.useCallback(() => {
    if (isFetching) {
      return;
    }

    log(`Finding previous element...`);
    setCurrentIndex((currentIndex) => {
      if (
        currentThreadViewMode != THREAD_VIEW_MODE.THREAD &&
        currentIndex < 1
      ) {
        return currentIndex;
      }
      const nextIndex =
        currentIndex > 0 ? currentIndex - 1 : elementsSequence.length - 1;
      const next = elementsSequence[nextIndex];
      tryScrollToElement(next, accentColor);
      return nextIndex;
    });
  }, [accentColor, isFetching, elementsSequence, currentThreadViewMode]);

  return {
    canBeamToNext,
    canBeamToPrevious,
    onBeamToNext,
    onBeamToPrevious,
    loadingMore,
  };
};
