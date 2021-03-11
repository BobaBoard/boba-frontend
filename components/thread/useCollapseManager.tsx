import React from "react";
import { isPost } from "types/Types";
import { useThreadContext } from "./ThreadContext";

type CollapseGroup = [string, string];

const getCollapseGroupId = (group: CollapseGroup) => {
  return `cg:${group[0]}_${group[1]}`;
};

const extractGroupData = (id: string) => {
  const groupStart = id.substring(3, id.lastIndexOf("_"));
  const groupEnd = id.substring(id.lastIndexOf("_") + 1);

  return [groupStart, groupEnd];
};

const isCollapseGroupId = (id: string) => {
  return id.startsWith("cg:");
};

export const useCollapseManager = () => {
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
        const group = extractGroupData(levelId);
        const firstIndex =
          threadDisplaySequence.findIndex(
            (x) => x.postId == group[0] || x.commentId == group[0]
          ) || 0;
        const lastIndex =
          threadDisplaySequence.findIndex(
            (x) => x.postId == group[1] || x.commentId == group[1]
          ) || 0;
        const totalPosts = threadDisplaySequence
          .slice(firstIndex, lastIndex + 1)
          .reduce((total, element) => total + (isPost(element) ? 1 : 0), 0);
        const totalComments = threadDisplaySequence
          .slice(firstIndex, lastIndex + 1)
          .reduce((total, element) => total + (isPost(element) ? 0 : 1), 0);
        return (
          <div>
            {totalPosts} contributions, {totalComments} comments skipped.
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
