import React from "react";

import { isCommentLoaded, scrollToComment } from "../thread/CommentsThread";
import { isPostLoaded, scrollToPost } from "../thread/ThreadPost";
import { CommentType, isComment, isPost, PostType } from "../../types/Types";
import {
  findFirstLevelParent,
  findNextSibling,
  findPreviousSibling,
} from "../../utils/thread-utils";
import { ThreadContextType, useThreadContext } from "../thread/ThreadContext";
import { CollapseManager } from "../thread/useCollapseManager";

import debug from "debug";
import { DisplayManager } from "./useDisplayMananger";
const error = debug("bobafrontend:useBeamToNew-error");
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

const scheduleScroll = ({
  threadElement,
  threadContext,
  collapseManager,
  displayManager,
  accentColor,
}: {
  threadElement: PostType | CommentType;
  threadContext: ThreadContextType;
  collapseManager: CollapseManager;
  displayManager: DisplayManager;
  accentColor: string | undefined;
}) => {
  const { threadRoot, threadDisplaySequence, postsInfoMap } = threadContext;
  const id = isPost(threadElement)
    ? threadElement.postId
    : threadElement.commentId;
  const index = threadDisplaySequence.findIndex((element) =>
    isPost(element) ? element.postId == id : element.commentId == id
  );
  const lastCurrentlyDisplayedIndex = Math.min(
    displayManager.maxDisplay,
    threadDisplaySequence.length - 1
  );
  // see if the post is beyond the currently displayed
  // TODO this actually should never happen because in that case it would be displayed
  if (index < lastCurrentlyDisplayedIndex) {
    error("Scheduled beaming to already displayed post.");
    tryScrollToElement(threadElement, accentColor || "#f96680");
    return;
  }
  const lastCurrentlyDisplayed =
    threadDisplaySequence[lastCurrentlyDisplayedIndex];
  info(`The last post displayed is: ${lastCurrentlyDisplayed}`);

  const lastVisibleElementFirstLevelParent = findFirstLevelParent(
    lastCurrentlyDisplayed,
    postsInfoMap
  );

  const firstCollapsedLvl1 = lastVisibleElementFirstLevelParent
    ? findNextSibling(lastVisibleElementFirstLevelParent, postsInfoMap)
    : // In case there's no visible first level parent contribution (e.g. because the only
      // displayed elements are comment replies to the thread root), we start from the first
      // children of root.
      postsInfoMap.get(threadRoot!.postId)?.children[0] || null;

  const newElementFirstLevelParent = findFirstLevelParent(
    threadElement,
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
  const collapseGroupId = collapseManager.addCollapseGroup(
    firstCollapsedLvl1!.postId,
    lastCollapsedLvl1!.postId
  );
  collapseManager.onCollapseLevel(collapseGroupId);
  log(
    `Adding collapse group: [${firstCollapsedLvl1!.postId}, ${
      lastCollapsedLvl1!.postId
    }]`
  );
  displayManager.displayToThreadElement(threadElement, () => {
    tryScrollToElement(threadElement, accentColor || "#f96680");
  });
};

export const useBeamToNew = (
  collapseManager: CollapseManager,
  displayManager: DisplayManager,
  accentColor: string | undefined
) => {
  const newRepliesIndex = React.useRef<number>(-1);
  const threadContext = useThreadContext();

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
    if (!tryScrollToElement(next, accentColor)) {
      scheduleScroll({
        threadElement: next,
        threadContext,
        collapseManager,
        displayManager,
        accentColor,
      });
    }
  }, [
    accentColor,
    collapseManager,
    hasBeamToNew,
    displayManager,
    isFetching,
    newRepliesSequence,
    threadContext,
  ]);

  return {
    hasBeamToNew,
    onNewAnswersButtonClick,
  };
};
