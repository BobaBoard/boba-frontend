import { useRealmContext } from "contexts/RealmContext";
import React from "react";
import { CssVariableSetting } from "types/Types";
import { PageTypes, usePageDetails } from "utils/router-utils";

export const useServerCssVariables = (ref: React.RefObject<HTMLDivElement>) => {
  const {
    indexPageSettings,
    boardPageSettings,
    threadPageSettings,
  } = useRealmContext();
  const { pageType } = usePageDetails();
  const previousValues = React.useRef({});
  React.useEffect(() => {
    if (!ref.current || !previousValues.current) {
      return;
    }
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
      currentPrevious[setting.name] = currentRef.style.getPropertyValue(
        propertyName
      );
      currentRef.style.setProperty(propertyName, setting.value);
    });
    return () => {
      settings.forEach((setting) => {
        const propertyName = `--${setting.name}`;
        currentRef.style.setProperty(
          propertyName,
          currentPrevious![setting.name]
        );
        previousValues.current = {};
      });
    };
  }, [pageType, boardPageSettings, indexPageSettings, threadPageSettings, ref]);
};
