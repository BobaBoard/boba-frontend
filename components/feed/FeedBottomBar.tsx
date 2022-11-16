import { ArrayParam, useQueryParams } from "use-query-params";
import { BoardOptions, useBoardOptions } from "../hooks/useBoardOptions";
import { BoardPageDetails, usePageDetails } from "utils/router-utils";
import { BottomBar, DefaultTheme } from "@bobaboard/ui-components";
import {
  EditorActions,
  useEditorsDispatch,
} from "components/editors/EditorsContext";
import {
  faAnglesDown,
  faAnglesUp,
  faCertificate,
  faCompass,
  faPauseCircle,
  faPencil,
  faThumbTack,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useCurrentRealmBoardId, useRealmContext } from "contexts/RealmContext";

import { ExistanceParam } from "components/QueryParamNextProvider";
import React from "react";
import { isFromBackButton } from "components/hooks/useFromBackButton";
import { useBeamToFeedElement } from "components/hooks/useBeamToFeedElement";
import { useBoardActivity } from "queries/board-feed";
import { useBoardMetadata } from "queries/board";
import { useNotifications } from "queries/notifications";
import { useUserFeed } from "queries/user-feed";
import { withEditors } from "components/editors/withEditors";

export interface FeedBottomBarProps {
  onCompassClick: () => void;
}

const BoardParams = {
  filter: ArrayParam,
};

const FeedParams = {
  showRead: ExistanceParam,
  ownOnly: ExistanceParam,
};

const FeedBottomBar = (props: FeedBottomBarProps) => {
  const [feedOptions] = useQueryParams(FeedParams);

  const [{ filter: categoryFilter }] = useQueryParams(BoardParams);
  const feedData = useUserFeed({
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
  } = useBeamToFeedElement({
    feed: feedData,
    accentColor: DefaultTheme.DEFAULT_ACCENT_COLOR,
  });

  return (
    <BottomBar
      accentColor={DefaultTheme.DEFAULT_ACCENT_COLOR}
      // TODO: add realm permissions here
      // realmPermissions.includes(RealmPermissions.CREATE_THREAD_ON_REALM)
      //   centerButton={{
      //     icon: faPencil,
      //     link: newThreadLink,
      //     color: "white",
      //   }}
      contextMenu={{
        icons: [],
        options: [],
      }}
    >
      <BottomBar.Button
        key="compass"
        icon={{ icon: faCompass }}
        link={{ onClick: props.onCompassClick }}
        position="left"
        desktopOnly
      />
      <BottomBar.Button
        key="jump up"
        icon={{ icon: canBeamToPrevious ? faAnglesUp : faPauseCircle }}
        link={{ onClick: onBeamToPrevious }}
        position="right"
        loading={loadingPrevious}
        disabled={!canBeamToPrevious}
      />
      <BottomBar.Button
        key="jump down"
        icon={{ icon: canBeamToNext ? faAnglesDown : faPauseCircle }}
        link={{ onClick: onBeamToNext }}
        position="right"
        loading={loadingNext}
        disabled={!canBeamToNext}
      />
    </BottomBar>
  );
};

export default withEditors(FeedBottomBar);
