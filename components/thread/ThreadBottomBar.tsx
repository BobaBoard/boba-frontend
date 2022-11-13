import { BoardOptions, useBoardOptions } from "../hooks/useBoardOptions";
import {
  BoardPageDetails,
  ThreadPageDetails,
  usePageDetails,
} from "utils/router-utils";
import { BottomBar, DefaultTheme } from "@bobaboard/ui-components";
import {
  EditorActions,
  useEditorsDispatch,
} from "components/editors/EditorsContext";
import {
  REALM_QUERY_KEY,
  useBoardSummary,
  useCurrentRealmBoardId,
  useRealmPermissions,
} from "contexts/RealmContext";
import { RealmPermissions, RealmType, ThreadSummaryType } from "types/Types";
import {
  faAnglesDown,
  faAnglesUp,
  faCertificate,
  faCompass,
  faEye,
  faEyeSlash,
  faPlusSquare,
  faThumbTack,
  faVolumeHigh,
  faVolumeOff,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useThreadEditors, withEditors } from "components/editors/withEditors";

import React from "react";
import { useBeamToElement } from "components/hooks/useBeamToElement";
import { useBoardMetadata } from "queries/board";
import { useDisplayManager } from "components/hooks/useDisplayMananger";
import { useThreadCollapseManager } from "./useCollapseManager";
import { useThreadContext } from "./ThreadContext";

export interface BoardBottomBarProps {
  onCompassClick: () => void;
}

const BoardBottomBar = (props: BoardBottomBarProps) => {
  const { slug } = usePageDetails<ThreadPageDetails>();
  if (!slug) {
    throw new Error("Using BoardBottomBar outside of Board page.");
  }
  const boardId = useCurrentRealmBoardId({ boardSlug: slug });
  const { boardMetadata } = useBoardMetadata({
    boardId,
  });
  const {
    threadRoot,
    isFetching: isFetchingThread,
    muted,
    hidden,
  } = useThreadContext();
  const { onNewContribution } = useThreadEditors();
  const newPostLink = React.useMemo(
    () => ({
      onClick: () => {
        threadRoot && onNewContribution(threadRoot.postId);
      },
    }),
    [onNewContribution, threadRoot]
  );
  const collapseManager = useThreadCollapseManager();
  const displayManager = useDisplayManager(collapseManager);
  const { canBeam, onBeamToElement, loading } = useBeamToElement(
    displayManager,
    boardMetadata?.accentColor
  );
  const {
    hasBeam,
    onBeamToNextRequest,
    onBeamToPreviousRequest,
    loading: beamToElementLoading,
  } = useBeamToElement(displayManager, boardMetadata?.accentColor);
  const boardOptions = useBoardOptions({
    options: [
      BoardOptions.MUTE,
      BoardOptions.PIN,
      BoardOptions.DISMISS_NOTIFICATIONS,
    ],
    boardId: boardMetadata?.id || null,
  });

  if (!boardMetadata) {
    return null;
  }

  return (
    <BottomBar
      accentColor={boardMetadata.accentColor}
      // TODO: add realm permissions here
      // canTopLevelPost
      centerButton={{
        icon: faPlusSquare,
        link: newPostLink,
        color: "white",
      }}
      contextMenu={{
        icons: [
          {
            id: "hidden",
            icon: hidden ? faEyeSlash : faEye,
            color: hidden ? "white" : "#2e2e30",
          },
          {
            id: "muted",
            icon: boardMetadata.muted ? faVolumeXmark : faVolumeHigh,
            color: muted ? "#2e2e30" : "white",
          },
        ],
        options: boardOptions,
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
        icon={{ icon: faAnglesUp }}
        // withNotification={
        //   hasBeamToNew
        //     ? {
        //         icon: faCertificate,
        //         color: DefaultTheme.DEFAULT_ACCENT_COLOR,
        //       }
        //     : null
        // }
        link={{ onClick: onBeamToPreviousRequest }}
        position="right"
      />
      <BottomBar.Button
        key="jump down"
        icon={{ icon: faAnglesDown }}
        withNotification={
          hasBeamToNew
            ? {
                icon: faCertificate,
                color: DefaultTheme.DEFAULT_ACCENT_COLOR,
              }
            : null
        }
        link={{
          onClick: hasBeamToNew ? onNewAnswersButtonClick : onBeamToNextRequest,
        }}
        position="right"
        loading={loading}
      />
    </BottomBar>
  );
};

export default withEditors(BoardBottomBar);
