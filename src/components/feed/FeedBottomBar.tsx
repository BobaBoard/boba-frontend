import { BottomBar, DefaultTheme } from "@bobaboard/ui-components";
import {
  faAnglesDown,
  faAnglesUp,
  faCompass,
  faPauseCircle,
} from "@fortawesome/free-solid-svg-icons";

import { ExistanceParam } from "components/QueryParamNextProvider";
import React from "react";
import { isFromBackButton } from "components/core/useFromBackButton";
import { useBeamToFeedElement } from "components/hooks/useBeamToFeedElement";
import { useQueryParams } from "use-query-params";
import { useUserFeed } from "queries/user-feed";
import { withEditors } from "components/core/editors/withEditors";

export interface FeedBottomBarProps {
  onCompassClick: () => void;
}

const FeedParams = {
  showRead: ExistanceParam,
  ownOnly: ExistanceParam,
};

const FeedBottomBar = (props: FeedBottomBarProps) => {
  const [feedOptions] = useQueryParams(FeedParams);

  const [params] = useQueryParams(FeedParams);

  const feed = useUserFeed({
    enabled: !isFromBackButton(),
    feedOptions,
  });
  const {
    canBeamToNext,
    onBeamToNext,
    canBeamToPrevious,
    onBeamToPrevious,
    loadingNext,
    loadingPrevious,
    resetBeamIndex,
  } = useBeamToFeedElement({
    feed,
    accentColor: DefaultTheme.DEFAULT_ACCENT_COLOR,
  });

  React.useEffect(() => {
    resetBeamIndex();
    // Note: resetBeamIndex will never change cause it's been declared with
    // useCallback and no dependency. If it did, this may need to be a more
    // complex condition.
  }, [params, resetBeamIndex]);

  const isEmptyFeed = feed.data?.pages?.[0]?.activity?.length === 0;
  return (
    <BottomBar
      accentColor={DefaultTheme.DEFAULT_ACCENT_COLOR}
      contextMenu={{
        icons: [],
        options: [],
      }}
    >
      <BottomBar.Button
        id="compass"
        icon={{ icon: faCompass }}
        link={{ onClick: props.onCompassClick }}
        position="left"
        desktopOnly
      />
      {(feed.status == "loading" || !isEmptyFeed) && (
        <>
          <BottomBar.Button
            id="jump up"
            icon={{ icon: canBeamToPrevious ? faAnglesUp : faPauseCircle }}
            link={{ onClick: onBeamToPrevious }}
            position="right"
            loading={loadingPrevious}
            disabled={!canBeamToPrevious}
          />
          <BottomBar.Button
            id="jump down"
            icon={{ icon: canBeamToNext ? faAnglesDown : faPauseCircle }}
            link={{ onClick: onBeamToNext }}
            position="right"
            loading={loadingNext}
            disabled={!canBeamToNext}
          />
        </>
      )}
    </BottomBar>
  );
};

export default withEditors(FeedBottomBar);
