import React from "react";
import { CommentType, isPost, PostType } from "types/Types";
import { useThreadContext } from "./ThreadContext";

import debug from "debug";
const error = debug("bobafrontend:useCollapseManager-error");
const log = debug("bobafrontend:useCollapseManager-log");
const info = debug("bobafrontend:useCollapseManager-info");

type CollapseGroup = [string, string];

const getCollapseGroupId = (group: CollapseGroup) => {
  return `cg:${group[0]}_${group[1]}`;
};

const extractCollapseGroupData = (id: string) => {
  const groupStart = id.substring(3, id.lastIndexOf("_"));
  const groupEnd = id.substring(id.lastIndexOf("_") + 1);

  return [groupStart, groupEnd];
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

const getLevelTotals = (
  levelId: string,
  threadDisplaySequence: (CommentType | PostType)[]
) => {
  if (!isCollapseGroupId(levelId)) {
    error(
      `Called unimplemented "getLevelTotals" on unsupported level ${levelId}`
    );
    return null;
  }
  const [first, last] = extractCollapseGroupData(levelId);
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
      `Something was wrong with collapse indexes for ${levelId}: [${firstCollapsedIndex}, ${lastCollapsedIndex}]`
    );
    return null;
  }
  return threadDisplaySequence
    .slice(firstCollapsedIndex, lastCollapsedIndex + 1)
    .reduce(
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
  const { threadDisplaySequence } = useThreadContext();
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

  const onUncollapseLevel = React.useCallback((levelId) => {
    setCollapse((collapse) => collapse.filter((id) => id != levelId));
    lastChanges.current.push({ levelId, collapsed: false });
  }, []);

  const getCollapseReason = React.useCallback(
    (levelId: string) => {
      if (isCollapseGroupId(levelId)) {
        const totals = getLevelTotals(levelId, threadDisplaySequence);
        return (
          <div>
            {totals?.totalPosts} contributions, {totals?.totalComments} comments
            skipped.
          </div>
        );
      }
      return <div>Subthread manually hidden.</div>;
    },
    [threadDisplaySequence]
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

  const addCollapseGroup = React.useCallback(
    (firstPostId: string, lastPostId: string) => {
      setCollapseGroups((collapseGroups) => [
        ...collapseGroups,
        [firstPostId, lastPostId],
      ]);
      return getCollapseGroupId([firstPostId, lastPostId]);
    },
    []
  );

  const getCollapseGroup = React.useCallback(
    (firstPostId: string) => {
      return collapseGroups.find((group) => group[0] == firstPostId);
    },
    [collapseGroups]
  );

  const reset = React.useCallback(() => {
    setCollapse([]);
    setCollapseGroups([]);
    collapseChangeSubscribers.current = [];
  }, [setCollapse, setCollapseGroups]);

  return {
    onCollapseLevel,
    onUncollapseLevel,
    getCollapseReason,
    onToggleCollapseLevel,
    isCollapsed,
    subscribeToCollapseChange,
    unsubscribeFromCollapseChange,
    reset,
    addCollapseGroup,
    getCollapseGroup,
    getCollapseGroupId,
    collapseGroups,
  };
};

export type CollapseManager = ReturnType<typeof useThreadCollapseManager>;
