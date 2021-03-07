import React from "react";

export const useCollapseManager = () => {
  const [collapse, setCollapse] = React.useState<string[]>([]);
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
  const getCollapseReason = React.useCallback(() => {
    return <div>Subthread manually hidden.</div>;
  }, []);
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

  return {
    onCollapseLevel,
    onUncollapseLevel,
    getCollapseReason,
    onToggleCollapseLevel,
    isCollapsed,
    subscribeToCollapseChange,
    unsubscribeFromCollapseChange,
  };
};
