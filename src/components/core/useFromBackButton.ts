import { NextRouter } from "next/router";
import React from "react";
export const BACK_BUTTON_STORAGE_KEY = "isBackButton";
let isBackButton = false;

export const isFromBackButton = () => {
  if (typeof window === "undefined") {
    return false;
  }
  return isBackButton;
};

const setBackButton = () => {
  isBackButton = true;
};
const clearBackButton = () => {
  isBackButton = false;
};
const useFromBackButton = (router: NextRouter) => {
  if (typeof window !== "undefined") {
    // TODO: won't this be added multiple times?
    window.onpopstate = setBackButton;
  }
  React.useEffect(() => {
    // This event seems to fire before onPopState, so we reset
    // the status of the back button every time, and it will
    // only be set to "true" if "onpopstate" fires.
    router.events.on("routeChangeStart", clearBackButton);
    return () => router.events.off("routeChangeStart", clearBackButton);
  }, [router.events]);
};

export default useFromBackButton;
