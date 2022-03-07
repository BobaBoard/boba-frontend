import { CommentType, PostType, isComment, isPost } from "types/Types";
import { isCommentLoaded, scrollToComment } from "../thread/CommentsThread";
import { isPostLoaded, scrollToPost } from "../thread/ThreadPost";

import { DisplayManager } from "./useDisplayMananger";
import React from "react";
import debug from "debug";
import { useStateWithCallback } from "./useStateWithCallback";
import { useThreadContext } from "../thread/ThreadContext";

// const error = debug("bobafrontend:useBeamToNew-error");
const log = debug("bobafrontend:useBeamToNew-log");
const info = debug("bobafrontend:useBeamToNew-info");

/**
 * Attempts scrolling to element if it's found in page. If not, returns false.
 */
const tryScrollToElement = (
  threadElement: PostType | CommentType,
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
  }
  return false;
};

/**
 * Gets the DOM Element corresponding to the given element of a thread.
 */
const getElementContainer = ({
  threadElement,
}: {
  threadElement: PostType | CommentType;
}) => {
  if (isPost(threadElement)) {
    return document.querySelector(
      `.post[data-post-id='${threadElement.postId}']`
    );
  } else if (isComment(threadElement)) {
    return document.querySelector(
      `.comment[data-comment-id='${threadElement.commentId}']`
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
  threadElement: PostType | CommentType;
}) => {
  const container = getElementContainer({ threadElement });
  if (!container) {
    return false;
  }
  return container.getBoundingClientRect().y <= 0;
};

/**
 * Gets the element after the current index in the given sequence of new replies, with wrap.
 */
const getNextElementIndex = ({
  currentIndex,
  newRepliesSequence,
}: {
  currentIndex: number;
  newRepliesSequence: (PostType | CommentType)[];
}) => {
  const nextIndex = (currentIndex + 1) % newRepliesSequence.length;
  const next = newRepliesSequence[nextIndex];
  // Skip the root post.
  if (!isPost(next) || next.parentPostId != null) {
    return nextIndex;
  }
  return (nextIndex + 1) % newRepliesSequence.length;
};

/**
 * Gets the next element after the current index that we have NOT scrolled past.
 * If we scrolled past them all, returns the first element.
 */
const getNextElementInViewIndex = ({
  currentIndex,
  newRepliesSequence,
}: {
  currentIndex: number;
  newRepliesSequence: (PostType | CommentType)[];
}) => {
  let nextIndex = getNextElementIndex({
    currentIndex,
    newRepliesSequence,
  });
  let next = newRepliesSequence[nextIndex];
  // Keep trying to go to the next element until we find one that is either
  // below the fold, or we find none are. In that case, we should start back
  // again from index zero.
  while (
    isScrolledPast({
      threadElement: next,
    })
  ) {
    nextIndex = getNextElementIndex({
      currentIndex: nextIndex,
      newRepliesSequence,
    });
    if (nextIndex < currentIndex) {
      // We've gone back to the beginning, return directly.
      return getNextElementIndex({
        currentIndex: -1,
        newRepliesSequence,
      });
    }
    next = newRepliesSequence[nextIndex];
  }
  return nextIndex;
};

export const useBeamToNew = (
  displayManager: DisplayManager,
  accentColor: string | undefined
) => {
  const newRepliesIndex = React.useRef<number>(-1);
  const threadContext = useThreadContext();
  const [loading, setLoading] = useStateWithCallback(false);

  const { threadRoot, newRepliesSequence, isFetching } = threadContext;

  // Skip if there's only one new post and it's the root.
  const hasBeamToNew =
    newRepliesSequence?.length &&
    !(newRepliesSequence.length == 1 && newRepliesSequence[0] === threadRoot);
  const onNewAnswersButtonClick = React.useCallback(() => {
    if (isFetching || !hasBeamToNew) {
      return;
    }

    log(`Finding next new reply...`);
    newRepliesIndex.current = getNextElementInViewIndex({
      currentIndex: newRepliesIndex.current,
      newRepliesSequence,
    });
    const next = newRepliesSequence[newRepliesIndex.current];
    info(newRepliesSequence);
    setLoading(true, () => {
      displayManager.displayToThreadElement(next, () => {
        tryScrollToElement(next, accentColor);
        setLoading(false);
      });
    });
  }, [
    accentColor,
    hasBeamToNew,
    displayManager,
    isFetching,
    newRepliesSequence,
    setLoading,
  ]);

  return {
    hasBeamToNew,
    onNewAnswersButtonClick,
    loading,
  };
};
