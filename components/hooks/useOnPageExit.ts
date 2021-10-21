import React from "react";
import { useRouter } from "next/router";

/**
 * Triggers callback when user exits the current page, while ignoring events
 * that simply change query parameters without actually changing the page itself.
 * */
export const useOnPageExit = (callback: () => void) => {
  const router = useRouter();
  // Make sure that the thread is marked as read/fetched again if the page changes.
  React.useEffect(() => {
    const saveCurrentPage = (nextRoute: string) => {
      const newPath = new URL(window.location.origin + nextRoute);
      const currentPath = new URL(window.location.origin + router.asPath);
      if (currentPath.pathname !== newPath.pathname) {
        callback();
      }
    };
    router.events.on("routeChangeStart", saveCurrentPage);
    return () => {
      router.events.off("routeChangeStart", saveCurrentPage);
    };
  }, [router.events, router.asPath, callback]);
};
