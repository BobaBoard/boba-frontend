import React from "react";
import { useRouter } from "next/router";

export const BACK_BUTTON_STORAGE_KEY = "isBackButton";
let isBackButton = false;

export const isFromBackButton = () => {
  if (typeof window === "undefined") {
    return false;
  }
  return isBackButton;
};

const useFromBackButton = () => {
  const router = useRouter();

  if (typeof window !== "undefined") {
    window.onpopstate = () => {
      isBackButton = true;
    };
  }
  React.useEffect(() => {
    // This event seems to fire before onPopState, so we reset
    // the status of the back button every time, and it will
    // only be set to "true" if "onpopstate" fires.
    router.events.on("routeChangeStart", () => {
      isBackButton = false;
    });
  }, []);
};

export default useFromBackButton;
