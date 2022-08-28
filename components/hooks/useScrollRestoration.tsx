import { NextRouter } from "next/router";
import React from "react";

let toRestore: { x: number; y: number } | null = null;
const saveScrollPosition = (nextRoute: string) => {
  console.log("routeChangeStart triggered to ", nextRoute);
  if (window.history.state.as === nextRoute) {
    console.log("skipping saveScrollPosition - reload");
    console.log(nextRoute);
    console.log(window.history.state);
    console.log(window.location);
    return;
  }
  if (window.history.state["cachedScrollPosition"]) {
    console.log(
      "skipping saveScrollPosition - already saved as ",
      window.history.state.cachedScrollPosition
    );
    return;
  }
  window.history.replaceState(
    {
      ...window.history.state,
      cachedScrollPosition: { x: window.scrollX, y: window.scrollY },
    },
    ""
  );
  console.log(
    "saved ScrollPosition as ",
    window.history.state.cachedScrollPosition
  );
  console.log("for as ", window.history.state.as);
};

const maybeRestoreScrollPostion = () => {
  console.log("routeChangeComplete triggered");
  if (toRestore) {
    const { x, y } = toRestore;
    console.log("inside maybeRestoreScrollPosition", window.history);
    window.scrollTo(x, y);
    console.log("scroll restored to", toRestore);
    console.log("on page", window.location);
    toRestore = null;
  } else {
    console.log("didn't restore scroll");
  }
};

const scheduleRestore = () => {
  console.log("beforeHistoryChange triggered");
  if (window.history.state["cachedScrollPosition"]) {
    toRestore = window.history.state["cachedScrollPosition"];
    console.log("restore scheduled", toRestore);
  } else {
    console.log("restore not scheduled");
  }
  console.log("scheduleRestore complete");
  return true;
};

export const useScrollRestoration = (router: NextRouter) => {
  React.useEffect(() => {
    console.log(window.history);
    console.log(window.history.state.as);
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
    return;
  }, [router.events]);
};
