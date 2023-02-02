import { NextRouter } from "next/router";
import React from "react";
import debug from "debug";

const log = debug("bobafrontend:useScrollRestoration-log");

// This is set or not set at the beginning of a route change,
// and stores the position to be scrolled to when the that change is completed
let toRestore: {
  page: string;
  scrollPosition: { x: number; y: number };
} | null = null;
// This is set when the back or forward button is used
// and stores the scroll position of the page you are leaving when we can't save it to the history state
// It may then be used to save it to the history state at the beginning of the next navigation before toRestore is set
let previousScroll: {
  location: string;
  scroll: { x: number; y: number };
} | null = null;
// This stores the location last navigated to at the end of a route change
// and may be used during the next navigation to set the location of previousScroll.
let previousLocation: string | null = null;
export const useScrollRestoration = (router: NextRouter) => {
  React.useEffect(() => {
    const saveScrollPosition = (nextRoute: string) => {
      log("routeChangeStart triggered to ", nextRoute);
      log("window location.toString", window.location.toString());
      log(window.history.state);
      // Next.js renders dynamic routes twice, see https://github.com/vercel/next.js/issues/12010
      // To avoid the second rendering from prematurely clearing our scheduled restore,
      // we need to bypass the duplicate trigger
      if (
        window.history.state.as === nextRoute &&
        nextRoute === toRestore?.page
      ) {
        log("reloading, keeping current restore");
        return;
      }
      if (nextRoute !== toRestore?.page) {
        clearRestore();
      }
      // In the case of going back and then forward, or forward then back,
      // We need to inject the saved scroll position from the previous location here if it matches the location we're going to,
      // so that it can be picked up when we schedule our restore.
      if (previousScroll) {
        log("previousScroll detected");
        if (window.location.toString() === previousScroll.location) {
          saveCachedScrollPosition(previousScroll.scroll);
        } else {
          log("did not substitute scroll position");
        }
        previousScroll = null;
        log("previousScroll cleared");
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
      log("routeChangeComplete triggered", window.history);
      maybeRestoreScrollPosition();
      previousLocation = window.location.toString();
      log("saved previousLocation", previousLocation);
    };

    const maybeRestoreScrollPosition = () => {
      if (toRestore) {
        const { x, y } = toRestore.scrollPosition;
        window.scrollTo(x, y);
        log("scroll restored to", toRestore.scrollPosition);
        log("on page", window.location);
      } else {
        log("didn't restore scroll, toRestore", toRestore);
      }
    };

    const scheduleRestore = () => {
      toRestore = {
        page: window.history.state.as,
        scrollPosition: { x: 0, y: 0 },
      };
      toRestore.scrollPosition = window.history.state.cachedScrollPosition;
      log("set Restore scrollPosition to", toRestore.scrollPosition);
      log("for page", toRestore.page);
    };

    const clearRestore = () => {
      toRestore = null;
      log("toRestore cleared", toRestore);
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
      log(
        "saved cachedScrollPosition as ",
        window.history.state.cachedScrollPosition
      );
    };

    // When the Back or Forward button is used, the window.history.state immediately changes to the page you are going to,
    // so we can't save the scroll position to the history state of the page you're leaving like we normally do.
    // This lets us know that a history navigation occurred and saves the scroll position to be injected on the next route change
    // if the back or forward button is used again to return to the same location.
    const onPopState = () => {
      log("Popstate triggered");
      if (previousLocation) {
        previousScroll = {
          location: previousLocation,
          scroll: { x: window.scrollX, y: window.scrollY },
        };
        log("saved previous scroll", previousScroll.scroll);
        log("for location", previousScroll.location);
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
