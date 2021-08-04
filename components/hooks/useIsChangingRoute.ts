import React from "react";

import { useRouter } from "next/router";
import { usePageDetails } from "utils/router-utils";

export const useIsChangingRoute = (props?: { onRouteChange?: () => void }) => {
  const router = useRouter();
  const [isChangingRoute, setChangingRoute] = React.useState(false);
  const { slug } = usePageDetails();
  const { onRouteChange = undefined } = props || {};

  React.useEffect(() => {
    if (isChangingRoute) {
      onRouteChange?.();
    }
  }, [isChangingRoute, onRouteChange]);

  React.useEffect(() => {
    const changeStartHandler = (destination: string) => {
      if (router.asPath !== destination) {
        setChangingRoute(true);
      }
    };
    const beforeHistoryChangeHandler = (destination: string) => {
      if (router.asPath !== destination) {
        setChangingRoute(true);
      }
    };
    const changeEndHandler = () => {
      setChangingRoute(false);
    };
    router.events.on("routeChangeStart", changeStartHandler);
    router.events.on("beforeHistoryChange", beforeHistoryChangeHandler);
    router.events.on("routeChangeComplete", changeEndHandler);
    return () => {
      router.events.off("routeChangeStart", changeStartHandler);
      router.events.off("beforeHistoryChange", beforeHistoryChangeHandler);
      router.events.off("routeChangeComplete", changeEndHandler);
    };
  }, [router.events, slug, router.asPath, onRouteChange]);

  return isChangingRoute;
};
