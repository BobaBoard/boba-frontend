import {
  CommentType,
  PostType,
  ThreadSummaryType,
  isComment,
  isPost,
  isThread,
} from "types/Types";
import {
  GALLERY_VIEW_SUB_MODE,
  THREAD_VIEW_MODE,
  TIMELINE_VIEW_SUB_MODE,
  useThreadViewContext,
} from "contexts/ThreadViewContext";
import { isCommentLoaded, scrollToComment } from "../thread/CommentsThread";
import { isPostLoaded, scrollToPost, scrollToThread } from "utils/scroll-utils";

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
 * Attempts scrolling to element if it's found in page. If not, returns false.
 */
export const tryScrollToElement = (
  threadElement: PostType | CommentType | ThreadSummaryType,
  accentColor: string | undefined
) => {
  if (isPost(threadElement) && isPostLoaded(threadElement.postId)) {
    scrollToPost(threadElement.postId, accentColor || "#f96680");
    return true;
  } else if (
    isComment(threadElement) &&
    isCommentLoaded(threadElement.commentId)
  ) {
    scrollToComment(threadElement.commentId, accentColor || "#f96680");
  } else if (isThread(threadElement)) {
    scrollToThread(threadElement.id, accentColor || "#f96680");
  }
  return false;
};

/**
 * Gets the DOM Element corresponding to the given element of a thread.
 */
const getElementContainer = ({
  threadElement,
}: {
  threadElement: PostType | CommentType | ThreadSummaryType;
}) => {
  if (isPost(threadElement)) {
    return document.querySelector(
      `.post[data-post-id='${threadElement.postId}']`
    );
  } else if (isComment(threadElement)) {
    return document.querySelector(
      `.comment[data-comment-id='${threadElement.commentId}']`
    );
  } else if (isThread(threadElement)) {
    return document.querySelector(
      `.thread[data-thread-id='${threadElement.id}']`
    );
  }
  throw new Error("Invalid threadElement");
};

/**
 * Checks if the given element has already been scrolled past.
 */
const isScrolledPast = ({
  threadElement,
}: {
  threadElement: PostType | CommentType | ThreadSummaryType;
}) => {
  const container = getElementContainer({ threadElement });
  if (!container) {
    return false;
  }
  return container.getBoundingClientRect().y <= 0;
};

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
  const currentIndex = React.useRef<number>(-1);
  const threadContext = useThreadContext();
  const [loading, setLoading] = useStateWithCallback(false);

  const { isFetching } = threadContext;
  const elementsSequence = useCurrentThreadDisplaySequence();

  const { currentThreadViewMode, galleryViewMode, timelineViewMode } =
    useThreadViewContext();

  React.useEffect(() => {
    // When the view mode changes, reset the sequence index.
    currentIndex.current = -1;
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
    currentIndex.current = getNextElementInViewIndex({
      currentIndex: currentIndex.current,
      elementsSequence: elementsSequence,
    });
    const next = elementsSequence[currentIndex.current];
    info(elementsSequence);
    setLoading(true, () => {
      displayManager.displayToThreadElement(next, () => {
        tryScrollToElement(next, accentColor);
        setLoading(false);
      });
    });
  }, [
    accentColor,
    canBeamToNext,
    displayManager,
    isFetching,
    setLoading,
    elementsSequence,
  ]);

  const canBeamToPrevious =
    elementsSequence.length > 0 && currentIndex.current < 1;
  const onBeamToPrevious = React.useCallback(() => {
    // TODO: we probably do need to index to be part of the state now
    if (isFetching || elementsSequence.length < 0 || currentIndex.current < 1) {
      return;
    }

    log(`Finding previous element...`);
    currentIndex.current = currentIndex.current - 1;
    const next = elementsSequence[currentIndex.current];
    tryScrollToElement(next, accentColor);
  }, [accentColor, isFetching, elementsSequence]);

  return {
    canBeamToNext,
    canBeamToPrevious,
    onBeamToNext,
    onBeamToPrevious,
    loading,
  };
};
