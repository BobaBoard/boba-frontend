import React from "react";
import debug from "debug";
import { useRouter } from "next/router";

// @ts-expect-error
const info = debug("bobafrontend:hooks:preventPageChange-info");
const log = debug("bobafrontend:hooks:preventPageChange-log");
// log.enabled = true;

// const POP_STATE_CALLBACKS = [] as ((state: any) => boolean)[];
export const usePreventPageChange = (
  shouldPrevent: () => boolean,
  onPageChange: ({
    url,
    historyNavigation,
    scrollPosition,
  }: {
    url: string;
    historyNavigation: boolean;
    scrollPosition?: { x: number; y: number };
  }) => void
  // dependencies: React.DependencyList = []
) => {
  const router = useRouter();
  // This ref and the useEffect that was supposed to update it were not consistently registering the editor as open on board pages (it worked fine on thread pages, so ¯\_(ツ)_/¯).
  // Clearly not too many boobies have accidentally hit the back button while creating a new thread because this bug currently exists in production.
  // Everything works properly when I just use shouldPrevent() directly in the callbacks, but if there is a reason this needs to be a ref, more debugging will be required.
  // const shouldCurrentlyPrevent = React.useRef(shouldPrevent());

  // This workaround you had didn't seem to be doing any good.
  // The whole handling of beforePopState in next is a mess. My intuition is that
  // there's something wrong with all the "before pop state" handlers firing.
  // By adding all our callbacks to a single handler, and then cycling through
  // all of them the situation seems to be better.
  // TODO: this would require investigation that is honestly not worth it,
  // and the Next forums are useless. Maybe do a google search periodically to
  // check whether a solution appears, or whether there's a fix to this method.
  // Router.beforePopState((state: any) => {
  //   log("beforePopState fired");
  //   let shouldHandle = true;
  //   POP_STATE_CALLBACKS.forEach((callback) => {
  //     shouldHandle = shouldHandle && callback(state);
  //   });
  //   return shouldHandle;
  // });

  // React.useEffect(() => {
  //   shouldCurrentlyPrevent.current = shouldPrevent();
  //   log("reset shouldCurrentlyPrevent.current");
  //   log("shouldCurrentlyPrevent.current", shouldCurrentlyPrevent.current);
  //   log("shouldPrevent", shouldPrevent());
  // }, [dependencies, shouldPrevent]);

  React.useEffect(() => {
    const unloadListener = (e: BeforeUnloadEvent) => {
      log("beforeUnload triggered");
      log("shouldPrevent", shouldPrevent());
      if (shouldPrevent()) {
        e.preventDefault();
        log("default prevented");
        e.returnValue = true;
      } else {
        log("default not prevented");
      }
    };
    const beforePopStateCallback = (eventState: any) => {
      // This seems backwards, but isn't if you look at the logs. History navigation is just batshit.
      const newPath = new URL(window.location.origin + eventState.as);
      log("newPath", newPath);
      const currentPath = new URL(window.location.origin + router.asPath);
      log("currentPath", currentPath);
      log("shouldPrevent", shouldPrevent());
      if (
        // This is changing to exactly the same path.
        (currentPath.pathname == newPath.pathname &&
          currentPath.search == newPath.search) ||
        !shouldPrevent()
      ) {
        log("same path or not set to prevent page change");
        return true;
      }
      log("history state", window.history.state);
      onPageChange({
        url: eventState.as,
        historyNavigation: true,
        scrollPosition: window.history.state.cachedScrollPosition ?? {
          x: 0,
          y: 0,
        },
      });
      log("not changing, onPageChange called with", eventState.as);
      return false;
    };

    // The internet seems to agree that throwing an error in the routeChangeStart handler is the only way to cancel a route change in Next
    // besides onPopState which only properly fires if you navigate the history
    const abortRouteChange = () => {
      router.events.emit("routeChangeError");
      throw "Route change aborted by usePreventPageChange. Please ignore this error.";
    };

    const handleRouteChange = (nextRoute: string) => {
      log(window.history.state);
      log("shouldPrevent", shouldPrevent());
      if (window.history.state.as === nextRoute || !shouldPrevent()) {
        log("same path or not set to prevent page change");
        return;
      }
      log("routeChangeStart triggered to", nextRoute);
      onPageChange({ url: nextRoute, historyNavigation: false });
      abortRouteChange();
    };

    // POP_STATE_CALLBACKS.push(beforePopStateCallback);
    router.beforePopState(beforePopStateCallback);
    router.events.on("routeChangeStart", handleRouteChange);
    window.addEventListener("beforeunload", unloadListener);
    return () => {
      // POP_STATE_CALLBACKS.splice(
      //   POP_STATE_CALLBACKS.indexOf(beforePopStateCallback, 1)
      // );
      router.events.off("routeChangeStart", handleRouteChange);
      window.removeEventListener("beforeunload", unloadListener);
    };
  }, [onPageChange, router.asPath, router, shouldPrevent]);
};
