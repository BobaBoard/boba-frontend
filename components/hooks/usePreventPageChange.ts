import React from "react";
import Router, { useRouter } from "next/router";

import debug from "debug";
// @ts-expect-error
const info = debug("bobafrontend:hooks:preventPageChange-info");

let POP_STATE_CALLBACKS = [] as ((state: any) => boolean)[];
export const usePreventPageChange = (
  shouldPrevent: () => boolean,
  onPageChange: () => void,
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
      if (shouldCurrentlyPrevent.current) {
        e.preventDefault();
        e.returnValue = true;
      }
    };
    const beforePopStateCallback = (state: any) => {
      const currentPath = new URL(window.location.origin + state.as);
      const newPath = new URL(window.location.origin + router.asPath);
      if (
        // This is changing to exactly the same path.
        (currentPath.pathname == newPath.pathname &&
          currentPath.search == newPath.search) ||
        !shouldCurrentlyPrevent.current
      ) {
        return true;
      }
      if (confirm("Are you sure you want to cancel?")) {
        onPageChange();
        return true;
      }
      history.forward();
      return false;
    };

    POP_STATE_CALLBACKS.push(beforePopStateCallback);

    window.addEventListener("beforeunload", unloadListener);
    return () => {
      POP_STATE_CALLBACKS.splice(
        POP_STATE_CALLBACKS.indexOf(beforePopStateCallback, 1)
      );
      window.removeEventListener("beforeunload", unloadListener);
    };
  }, []);
};
