import React from "react";
import { useRouter } from "next/router";

export const BACK_BUTTON_STORAGE_KEY = "restored";

export const isFromBackButton = () => {
  return (
    typeof window !== "undefined" &&
    sessionStorage.getItem(BACK_BUTTON_STORAGE_KEY) !== "true"
  );
};

const useFromBackButton = () => {
  const router = useRouter();
  React.useEffect(() => {
    if ("scrollRestoration" in window.history) {
      let isBack: boolean | null = null;

      router.events.on("routeChangeStart", () => {
        if (window.history.state["BACK_BUTTON_STORAGE_KEY"]) {
          return;
        }
        sessionStorage.setItem(BACK_BUTTON_STORAGE_KEY, "false");
        window.history.replaceState(
          {
            ...window.history.state,
            [BACK_BUTTON_STORAGE_KEY]: true,
          },
          ""
        );
      });

      router.events.on("routeChangeComplete", () => {
        if (isBack) {
          sessionStorage.setItem(BACK_BUTTON_STORAGE_KEY, "true");
          isBack = null;
        }
      });

      router.events.on("beforeHistoryChange", () => {
        if (window.history.state[BACK_BUTTON_STORAGE_KEY]) {
          isBack = window.history.state[BACK_BUTTON_STORAGE_KEY];
        }
        return true;
      });
    }
  }, []);
};

export default useFromBackButton;
