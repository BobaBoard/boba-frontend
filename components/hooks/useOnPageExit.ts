import React from "react";
import { useRouter } from "next/router";

/**
 * Triggers callback when user exits the current page, while ignoring events
 * that simply change query parameters without actually changing the page itself.
 * */
export const useOnPageExit = (callback: () => void) => {
  const router = useRouter();
  // We use these because, under certain conditions I'm still unsure of,
  // the route change effects will trigger twice BUT we want to make sure
  // we call the callback only once.
  const triggerCallback = React.useRef<boolean>(false);

  React.useEffect(() => {
    const saveCurrentPage = (nextRoute: string) => {
      const newPath = new URL(window.location.origin + nextRoute);
      const currentPath = new URL(window.location.origin + router.asPath);
      if (currentPath.pathname !== newPath.pathname) {
        triggerCallback.current = true;
      }
    };
    const maybeTriggerCallback = () => {
      if (triggerCallback.current) {
        triggerCallback.current = false;
        router.events.off("routeChangeComplete", maybeTriggerCallback);
        callback();
      }
    };
    router.events.on("routeChangeStart", saveCurrentPage);
    router.events.on("routeChangeComplete", maybeTriggerCallback);
    return () => {
      router.events.off("routeChangeStart", saveCurrentPage);
      if (!triggerCallback.current) {
        router.events.off("routeChangeComplete", maybeTriggerCallback);
      }
    };
  }, [router.events, router.asPath, callback]);
};
