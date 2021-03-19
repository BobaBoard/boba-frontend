import React from "react";
import { CommentType, isPost, PostType } from "types/Types";
import { useThreadContext } from "./ThreadContext";

import debug from "debug";
const error = debug("bobafrontend:useCollapseManager-error");
const log = debug("bobafrontend:useCollapseManager-log");
const info = debug("bobafrontend:useCollapseManager-info");

export enum CollapseReasons {
  MANUAL,
  SKIPPED_LOADING,
  FILTERED,
}

export interface CollapseGroup {
  startsFrom: string;
  endsWith: string;
  collapseReason: CollapseReasons;
}
const THREAD_UNRAVEL_STEP = 5;

const getCollapseGroupId = (group: CollapseGroup) => {
  return `cg:${group.startsFrom}_${group.endsWith}`;
};

const extractCollapseGroupData = (
  collapseGroups: CollapseGroup[],
  id: string
) => {
  const groupStart = id.substring(3, id.lastIndexOf("_"));
  const groupEnd = id.substring(id.lastIndexOf("_") + 1);

  return collapseGroups.find(
    (group) => group.startsFrom == groupStart && group.endsWith == groupEnd
  );
};

const isCollapseGroupId = (id: string) => {
  return id.startsWith("cg:");
};

export const getCommentThreadId = (postId: string) => {
  return `${postId}_comment`;
};

export const extractPostId = (levelId: string) => {
  if (levelId.indexOf(`_comment`) === -1) {
    return levelId;
  }
  return levelId.substring(0, levelId.indexOf(`_comment`));
};

export const getPostLevelId = (postId: string) => {
  return postId;
};

export const getCollapsedPostsForGroup = (
  collapseGroup: CollapseGroup,
  threadDisplaySequence: (CommentType | PostType)[]
) => {
  const { startsFrom: first, endsWith: last } = collapseGroup;
  const firstCollapsedIndex = threadDisplaySequence.findIndex((threadElement) =>
    isPost(threadElement)
      ? threadElement.postId == first
      : threadElement.commentId == first
  );
  const lastCollapsedIndex = threadDisplaySequence.findIndex((threadElement) =>
    isPost(threadElement)
      ? threadElement.postId == last
      : threadElement.commentId == last
  );
  if (
    !firstCollapsedIndex ||
    !lastCollapsedIndex ||
    lastCollapsedIndex < firstCollapsedIndex
  ) {
    error(
      `Something was wrong with collapse indexes for collapsedGroup: [${firstCollapsedIndex}, ${lastCollapsedIndex}]`
    );
    return null;
  }
  return threadDisplaySequence.slice(
    firstCollapsedIndex,
    lastCollapsedIndex + 1
  );
};

const getLevelTotals = (
  levelId: string,
  collapseGroups: CollapseGroup[],
  threadDisplaySequence: (CommentType | PostType)[]
) => {
  const collapseGroup = extractCollapseGroupData(collapseGroups, levelId);
  if (!collapseGroup) {
    return {
      totalPosts: 0,
      totalComments: 0,
    };
  }
  const collapsedPosts = getCollapsedPostsForGroup(
    collapseGroup,
    threadDisplaySequence
  );
  if (!collapsedPosts) {
    return null;
  }
  return collapsedPosts.reduce(
    (total, element) =>
      isPost(element)
        ? {
            ...total,
            totalPosts: total.totalPosts + 1,
          }
        : {
            ...total,
            totalComments: total.totalComments + 1,
          },
    {
      totalPosts: 0,
      totalComments: 0,
    }
  );
};

export const useThreadCollapseManager = () => {
  const {
    threadDisplaySequence,
    postsInfoMap,
    threadRoot,
  } = useThreadContext();
  const [collapse, setCollapse] = React.useState<string[]>([]);
  const [collapseGroups, setCollapseGroups] = React.useState<CollapseGroup[]>(
    []
  );
  const collapseChangeSubscribers = React.useRef<
    ((levelId: string, collapsed: boolean) => void)[]
  >([]);
  const lastChanges = React.useRef<{ levelId: string; collapsed: boolean }[]>(
    []
  );

  const onCollapseLevel = React.useCallback((levelId) => {
    setCollapse((collapse) => [...collapse, levelId]);
    lastChanges.current.push({ levelId, collapsed: true });
  }, []);

  const addCollapseGroup = React.useCallback(
    (
      firstPostId: string,
      lastPostId: string,
      collapseReason: CollapseReasons = CollapseReasons.MANUAL
    ) => {
      const newGroup = {
        startsFrom: firstPostId,
        endsWith: lastPostId,
        collapseReason,
      };
      setCollapseGroups((collapseGroups) => [...collapseGroups, newGroup]);
      return getCollapseGroupId(newGroup);
    },
    []
  );

  const onPartiallyUncollapseGroup = React.useCallback(
    (groupId: string, fromEnd: boolean) => {
      let newGroup: CollapseGroup | null = null;
      const collapseGroup = extractCollapseGroupData(collapseGroups, groupId);
      if (!collapseGroup) {
        error(`Somethign went very wrong for group id ${groupId}`);
        return;
      }
      const newCollapseGroups = collapseGroups.filter(
        (group) =>
          collapseGroup.startsFrom !== group.startsFrom ||
          collapseGroup.endsWith !== group.endsWith
      );
      const firstLevelContributions =
        postsInfoMap.get(threadRoot!.postId)?.children || [];
      const firstElementIndex = firstLevelContributions.findIndex(
        (element) => element.postId == collapseGroup[0]
      );
      const lastElementIndex = firstLevelContributions.findIndex(
        (element) => element.postId == collapseGroup[1]
      );
      if (lastElementIndex - firstElementIndex > THREAD_UNRAVEL_STEP) {
        info(`Uncollapsing of long thread. Being smart about it.`);
        info(
          `Current first element is element ${firstElementIndex} of ${firstLevelContributions.length} first level items.`
        );
        newGroup = !fromEnd
          ? {
              startsFrom:
                firstLevelContributions[firstElementIndex + THREAD_UNRAVEL_STEP]
                  .postId,
              endsWith: collapseGroup[1],
              collapseReason: CollapseReasons.MANUAL,
            }
          : {
              startsFrom: collapseGroup[0],
              endsWith:
                firstLevelContributions[lastElementIndex - THREAD_UNRAVEL_STEP]
                  .postId,
              collapseReason: CollapseReasons.MANUAL,
            };
        newCollapseGroups.push(newGroup);
      }
      setCollapseGroups(newCollapseGroups);
      setCollapse((collapse) => {
        const filteredCollapse = collapse.filter((id) => id != groupId);
        if (newGroup) {
          filteredCollapse.push(getCollapseGroupId(newGroup));
        }
        return filteredCollapse;
      });
      lastChanges.current.push({ levelId: groupId, collapsed: false });
      if (newGroup) {
        lastChanges.current.push({
          levelId: getCollapseGroupId(newGroup),
          collapsed: true,
        });
      }
    },
    [collapseGroups, postsInfoMap, threadRoot]
  );

  const onUncollapseLevel = React.useCallback((levelId) => {
    if (isCollapseGroupId(levelId)) {
      log(`Uncollapsing group ${levelId}`);
      setCollapseGroups((collapseGroups) =>
        collapseGroups.filter(
          (collapseGroup) => getCollapseGroupId(collapseGroup) != levelId
        )
      );
    }
    setCollapse((collapse) => collapse.filter((id) => id != levelId));
    lastChanges.current.push({ levelId, collapsed: false });
  }, []);

  const getCollapseReason = React.useCallback(
    (levelId: string) => {
      if (isCollapseGroupId(levelId)) {
        const totals = getLevelTotals(
          levelId,
          collapseGroups,
          threadDisplaySequence
        );
        return (
          <div>
            {totals?.totalPosts} contributions, {totals?.totalComments} comments
            skipped.
          </div>
        );
      }
      return <div>Subthread manually hidden.</div>;
    },
    [threadDisplaySequence, collapseGroups]
  );

  const isCollapsed = React.useCallback(
    (levelId) => {
      return collapse.includes(levelId);
    },
    [collapse]
  );
  const onToggleCollapseLevel = React.useCallback(
    (levelId) => {
      isCollapsed(levelId)
        ? onUncollapseLevel(levelId)
        : onCollapseLevel(levelId);
    },
    [isCollapsed, onUncollapseLevel, onCollapseLevel]
  );

  React.useEffect(() => {
    if (!lastChanges.current) {
      return;
    }
    const lastChangesDetails = lastChanges.current;
    collapseChangeSubscribers.current.forEach((subscriber) => {
      lastChangesDetails.forEach((change) => {
        subscriber(change.levelId, change.collapsed);
      });
    });
    lastChanges.current = [];
  }, [collapse]);

  const subscribeToCollapseChange = React.useCallback(
    (subscriber: (levelId: string, collapsed: boolean) => void) => {
      collapseChangeSubscribers.current.push(subscriber);
    },
    []
  );

  const unsubscribeFromCollapseChange = React.useCallback(
    (subscriber: (levelId: string, collapsed: boolean) => void) => {
      collapseChangeSubscribers.current.push(subscriber);
    },
    []
  );

  const getCollapseGroupAt = React.useCallback(
    (firstPostId: string) => {
      const collapseGroup = collapseGroups.find(
        (group) => group[0] == firstPostId
      );
      if (!collapseGroup) {
        return null;
      }
      const collapseGroupId = getCollapseGroupId(collapseGroup);

      return {
        collapseGroup,
        firstElement: collapseGroup[0],
        lastElement: collapseGroup[1],
        collapseGroupId,
        totals: getLevelTotals(
          collapseGroupId,
          collapseGroups,
          threadDisplaySequence
        ),
      };
    },
    [collapseGroups, threadDisplaySequence]
  );

  const reset = React.useCallback(() => {
    setCollapse([]);
    setCollapseGroups([]);
    collapseChangeSubscribers.current = [];
  }, [setCollapse, setCollapseGroups]);

  return React.useMemo(
    () => ({
      onCollapseLevel,
      onUncollapseLevel,
      getCollapseReason,
      onToggleCollapseLevel,
      isCollapsed,
      subscribeToCollapseChange,
      unsubscribeFromCollapseChange,
      reset,
      addCollapseGroup,
      getCollapseGroupAt,
      getCollapseGroupId,
      onPartiallyUncollapseGroup,
      collapseGroups,
    }),
    [
      onCollapseLevel,
      onUncollapseLevel,
      getCollapseReason,
      onToggleCollapseLevel,
      isCollapsed,
      subscribeToCollapseChange,
      unsubscribeFromCollapseChange,
      reset,
      addCollapseGroup,
      getCollapseGroupAt,
      collapseGroups,
      onPartiallyUncollapseGroup,
    ]
  );
};
useThreadCollapseManager.whyDidYouRender = true;
export type CollapseManager = ReturnType<typeof useThreadCollapseManager>;
