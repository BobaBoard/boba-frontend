import { PageTypes, usePageDetails } from "lib/router";

import { CssVariableSetting } from "types/Types";
import React from "react";
import { useRealmSettings } from "contexts/RealmContext";

export const useServerCssVariables = (ref: React.RefObject<HTMLDivElement>) => {
  const {
    indexPage: indexPageSettings,
    boardPage: boardPageSettings,
    threadPage: threadPageSettings,
  } = useRealmSettings();
  const { pageType } = usePageDetails();
  const previousValues = React.useRef({});
  const previousPage = React.useRef<PageTypes>();
  React.useEffect(() => {
    if (!ref.current || !previousValues.current) {
      return;
    }
    const currentPage = pageType;
    const currentRef = ref.current;
    const currentPrevious = previousValues.current;
    let settings: CssVariableSetting[] = [];
    switch (pageType) {
      case PageTypes.BOARD:
        settings = boardPageSettings;
        break;
      case PageTypes.HOME:
        settings = indexPageSettings;
        break;
      case PageTypes.THREAD:
      case PageTypes.POST:
        settings = threadPageSettings;
    }
    settings.forEach((setting) => {
      const propertyName = `--${setting.name}`;
      currentPrevious[setting.name] =
        currentRef.style.getPropertyValue(propertyName);
      currentRef.style.setProperty(propertyName, setting.value);
    });
    return () => {
      settings.forEach((setting) => {
        if (currentPage === previousPage.current) {
          return;
        }
        const propertyName = `--${setting.name}`;
        currentRef.style.setProperty(
          propertyName,
          currentPrevious![setting.name]
        );
        previousValues.current = {};
        previousPage.current = currentPage || undefined;
      });
    };
  }, [pageType, boardPageSettings, indexPageSettings, threadPageSettings, ref]);
};
