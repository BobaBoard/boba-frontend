import Router, { useRouter } from "next/router";

import React from "react";
import debug from "debug";

// @ts-expect-error
const info = debug("bobafrontend:hooks:preventPageChange-info");
const log = debug("bobafrontend:hooks:preventPageChange-log");
// log.enabled = true;

const POP_STATE_CALLBACKS = [] as ((state: any) => boolean)[];
export const usePreventPageChange = (
  shouldPrevent: () => boolean,
  onPageChange: (url: string) => void,
  dependencies: React.DependencyList = []
) => {
  const router = useRouter();
  const shouldCurrentlyPrevent = React.useRef(shouldPrevent());

  // The whole handling of beforePopState in next is a mess. My intuition is that
  // there's something wrong with all the "before pop state" handlers firing.
  // By adding all our callbacks to a single handler, and then cycling through
  // all of them the situation seems to be better.
  // TODO: this would require investigation that is honestly not worth it,
  // and the Next forums are useless. Maybe do a google search periodically to
  // check whether a solution appears, or whether there's a fix to this method.
  Router.beforePopState((state: any) => {
    log("beforePopState fired");
    let shouldHandle = true;
    POP_STATE_CALLBACKS.forEach((callback) => {
      shouldHandle = shouldHandle && callback(state);
    });
    return shouldHandle;
  });

  React.useEffect(() => {
    shouldCurrentlyPrevent.current = shouldPrevent();
  }, [dependencies]);

  React.useEffect(() => {
    const unloadListener = (e: BeforeUnloadEvent) => {
      log("beforeUnload triggered");
      if (shouldCurrentlyPrevent.current) {
        e.preventDefault();
        log("default prevented");
        e.returnValue = true;
      } else {
        log("default not prevented");
      }
    };
    const beforePopStateCallback = (state: any) => {
      // This seems backwards, but isn't if you look at the logs. History navigation is just batshit.
      const newPath = new URL(window.location.origin + state.as);
      log("newPath", newPath);
      const currentPath = new URL(window.location.origin + router.asPath);
      log("currentPath", currentPath);
      if (
        // This is changing to exactly the same path.
        (currentPath.pathname == newPath.pathname &&
          currentPath.search == newPath.search) ||
        !shouldCurrentlyPrevent.current
      ) {
        log("shouldCurrentlyPrevent.current", shouldCurrentlyPrevent.current);
        log("same path or not set to prevent page change");
        return true;
      }
      onPageChange(state.as);
      history.forward();
      log("not changing, onPageChange called with", state.as);
      return false;
    };

    // The internet seems to agree that throwing an error in the routeChangeStart hamdler is the only way to cancel a route change in Next
    // besides onPopState which only properly fires if you navigate the history
    const abortRouteChange = () => {
      router.events.emit("routeChangeError");
      throw "Route change aborted by usePreventPageChange. Please ignore this error.";
    };

    const handleRouteChange = (nextRoute: string) => {
      log(window.history.state);
      if (
        window.history.state.as === nextRoute ||
        !shouldCurrentlyPrevent.current
      ) {
        log("same path or not set to prevent page change");
        return;
      }
      log("routeChangeStart triggered to", nextRoute);
      onPageChange(nextRoute);
      abortRouteChange();
    };

    POP_STATE_CALLBACKS.push(beforePopStateCallback);

    router.events.on("routeChangeStart", handleRouteChange);
    window.addEventListener("beforeunload", unloadListener);
    return () => {
      POP_STATE_CALLBACKS.splice(
        POP_STATE_CALLBACKS.indexOf(beforePopStateCallback, 1)
      );
      router.events.off("routeChangeStart", handleRouteChange);
      window.removeEventListener("beforeunload", unloadListener);
    };
  }, [onPageChange, router.asPath, router.events]);
};
