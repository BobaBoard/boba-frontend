import React from "react";
import { NextRouter } from "next/router";

let toRestore: { x: number; y: number } | null = null;
const saveScrollPosition = () => {
  if (window.history.state["cachedScrollPosition"]) {
    return;
  }
  window.history.replaceState(
    {
      ...window.history.state,
      cachedScrollPosition: { x: window.scrollX, y: window.scrollY },
    },
    ""
  );
};

const maybeRestoreScrollPostion = () => {
  if (toRestore) {
    const { x, y } = toRestore;
    window.scrollTo(x, y);
    toRestore = null;
  }
};

const scheduleRestore = () => {
  if (window.history.state["cachedScrollPosition"]) {
    toRestore = window.history.state["cachedScrollPosition"];
  }
  return true;
};

export const useScrollRestoration = (router: NextRouter) => {
  React.useEffect(() => {
    if ("scrollRestoration" in window.history) {
      router.events.on("routeChangeStart", saveScrollPosition);
      router.events.on("routeChangeComplete", maybeRestoreScrollPostion);
      router.events.on("beforeHistoryChange", scheduleRestore);
      return () => {
        router.events.off("routeChangeStart", saveScrollPosition);
        router.events.off("routeChangeComplete", maybeRestoreScrollPostion);
        router.events.off("beforeHistoryChange", scheduleRestore);
      };
    }
  }, [router.events]);
};
