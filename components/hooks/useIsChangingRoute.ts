import React from "react";

import { useRouter } from "next/router";
import { usePageDetails } from "utils/router-utils";

export const useIsChangingRoute = () => {
  const router = useRouter();
  const [isChangingRoute, setChangingRoute] = React.useState(false);
  const { slug } = usePageDetails();
  React.useEffect(() => {
    const changeStartHandler = (destination: string) => {
      if (window.location.pathname !== destination) {
        setChangingRoute(true);
      }
    };
    const beforeHistoryChangeHandler = (destination: string) => {
      if (window.location.pathname !== destination) {
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
  }, [router.events, slug, router.asPath]);

  //  return React.memo({isChangingRoute, destination: router.asPath}, [isChangingRoute, router.asPath];
  return isChangingRoute;
};
