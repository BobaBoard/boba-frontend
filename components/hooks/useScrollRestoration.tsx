import { NextRouter } from "next/router";
import React from "react";

let toRestore: {
  page: string;
  scrollPosition: { x: number; y: number };
} | null = null;
let previousScroll: {
  location: string;
  scroll: { x: number; y: number };
} | null = null;
let previousLocation: string | null = null;
export const useScrollRestoration = (router: NextRouter) => {
  React.useEffect(() => {
    const saveScrollPosition = (nextRoute: string) => {
      console.log("routeChangeStart triggered to ", nextRoute);
      console.log("window location.toString", window.location.toString());
      console.log(window.history.state);
      // Next.js renders dynamic routes twice, see https://github.com/vercel/next.js/issues/12010
      // To avoid the second rendering from prematurely clearing our scheduled restore,
      // we need to bypass the duplicate trigger
      if (
        window.history.state.as === nextRoute &&
        nextRoute === toRestore?.page
      ) {
        console.log("reloading, keeping current restore");
        return;
      }
      if (nextRoute !== toRestore?.page) {
        clearRestore();
      }
      // In the case of going back and then forward, or forward then back,
      // We need to inject the saved scroll position from the previous location here if it matches the location we're going to,
      // so that it can be picked up when we schedule our restore.
      if (previousScroll) {
        console.log("previousScroll detected");
        if (window.location.toString() === previousScroll.location) {
          saveCachedScrollPosition(previousScroll.scroll);
        } else {
          console.log("did not substitute scroll position");
        }
        previousScroll = null;
        console.log("previousScroll cleared");
      }
      if (window.history.state.cachedScrollPosition) {
        scheduleRestore();
      }
      if (window.history.state.as !== nextRoute) {
        clearRestore();
        saveCachedScrollPosition({ x: window.scrollX, y: window.scrollY });
      }
    };

    const onComplete = () => {
      console.log("routeChangeComplete triggered", window.history);
      maybeRestoreScrollPosition();
      previousLocation = window.location.toString();
      console.log("saved previousLocation", previousLocation);
    };

    const maybeRestoreScrollPosition = () => {
      if (toRestore) {
        const { x, y } = toRestore.scrollPosition;
        window.scrollTo(x, y);
        console.log("scroll restored to", toRestore.scrollPosition);
        console.log("on page", window.location);
      } else {
        console.log("didn't restore scroll, toRestore", toRestore);
        console.log(
          "didn't restore scroll, cachedScrollPosition",
          window.history.state["cachedScrollPosition"]
        );
      }
    };

    const scheduleRestore = () => {
      toRestore = {
        page: window.history.state.as,
        scrollPosition: { x: 0, y: 0 },
      };
      toRestore.scrollPosition = window.history.state.cachedScrollPosition;
      console.log("Restore scrollPosition set to", toRestore.scrollPosition);
      console.log("for page", toRestore.page);
    };

    const clearRestore = () => {
      toRestore = null;
      console.log("toRestore cleared", toRestore);
    };

    const saveCachedScrollPosition = (scrollPosition: {
      x: number;
      y: number;
    }) => {
      window.history.replaceState(
        {
          ...window.history.state,
          cachedScrollPosition: scrollPosition,
        },
        ""
      );
      console.log(
        "saved cachedScrollPosition as ",
        window.history.state.cachedScrollPosition
      );
    };

    // When the Back or Forward button is used, the window.history.state immediately changes to the page you are going to,
    // so we can't save the scroll position to the history state of the page you're leaving like we normally do.
    // This lets us know that a history navigation occurred and saves the scroll position to be injected on the next route change
    // if the back or forward button is used again to return to the same location.
    const onPopState = () => {
      console.log("Popstate triggered");
      if (previousLocation) {
        previousScroll = {
          location: previousLocation,
          scroll: { x: window.scrollX, y: window.scrollY },
        };
        console.log("saved previous scroll", previousScroll.scroll);
        console.log("for location", previousScroll.location);
      }
    };

    if ("scrollRestoration" in window.history) {
      router.events.on("routeChangeStart", saveScrollPosition);
      router.events.on("routeChangeComplete", onComplete);
      window.addEventListener("popstate", onPopState);
      return () => {
        router.events.off("routeChangeStart", saveScrollPosition);
        router.events.off("routeChangeComplete", onComplete);
        window.removeEventListener("popstate", onPopState);
      };
    }
    return;
  }, [router.events]);
};
