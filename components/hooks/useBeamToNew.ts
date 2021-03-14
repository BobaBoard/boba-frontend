import React from "react";

import { isCommentLoaded, scrollToComment } from "../thread/CommentsThread";
import { isPostLoaded, scrollToPost } from "../thread/ThreadPost";
import { CommentType, isComment, isPost, PostType } from "../../types/Types";
import { useThreadContext } from "../thread/ThreadContext";

import debug from "debug";
import { DisplayManager } from "./useDisplayMananger";
// const error = debug("bobafrontend:useBeamToNew-error");
const log = debug("bobafrontend:useBeamToNew-log");
const info = debug("bobafrontend:useBeamToNew-info");

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

export const useBeamToNew = (
  displayManager: DisplayManager,
  accentColor: string | undefined
) => {
  const newRepliesIndex = React.useRef<number>(-1);
  const threadContext = useThreadContext();
  const [loading, setLoading] = React.useState(false);

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
    // @ts-ignore
    newRepliesIndex.current =
      (newRepliesIndex.current + 1) % newRepliesSequence.length;
    let next = newRepliesSequence[newRepliesIndex.current];
    // Skip the root post.
    if (isPost(next) && next.parentPostId == null) {
      newRepliesIndex.current =
        (newRepliesIndex.current + 1) % newRepliesSequence.length;
      // This won't be the root, cause we already addressed the case when the root is the only
      // new post.
      next = newRepliesSequence[newRepliesIndex.current];
      info(`...skipping the root...`);
    }
    log(`Beaming to new reply with index ${newRepliesIndex}`);
    info(newRepliesSequence);
    setLoading(true);
    displayManager.displayToThreadElement(next, () => {
      tryScrollToElement(next, accentColor);
      setLoading(false);
    });
  }, [
    accentColor,
    hasBeamToNew,
    displayManager,
    isFetching,
    newRepliesSequence,
  ]);

  return {
    hasBeamToNew,
    onNewAnswersButtonClick,
    loading,
  };
};
