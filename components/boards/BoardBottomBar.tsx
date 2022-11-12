import { BoardOptions, useBoardOptions } from "../hooks/useBoardOptions";
import { BoardPageDetails, usePageDetails } from "utils/router-utils";
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
  faPencil,
  faPencilSquare,
  faPlusSquare,
  faThumbTack,
  faVolumeHigh,
  faVolumeOff,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";

import React from "react";
import { useBoardMetadata } from "queries/board";
import { withEditors } from "components/editors/withEditors";

export interface BoardBottomBarProps {
  onCompassClick: () => void;
}

const BoardBottomBar = (props: BoardBottomBarProps) => {
  const { slug } = usePageDetails<BoardPageDetails>();
  if (!slug) {
    throw new Error("Using BoardBottomBar outside of Board page.");
  }
  const boardId = useCurrentRealmBoardId({ boardSlug: slug });
  const { boardMetadata } = useBoardMetadata({
    boardId,
  });
  const editorDispatch = useEditorsDispatch();
  const newThreadLink = React.useMemo(
    () => ({
      onClick: () => {
        if (!boardMetadata) {
          return;
        }
        editorDispatch({
          type: EditorActions.NEW_THREAD,
          payload: { boardId: boardMetadata.id },
        });
      },
    }),
    [editorDispatch, boardMetadata]
  );
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
      // realmPermissions.includes(RealmPermissions.CREATE_THREAD_ON_REALM)
      centerButton={{
        icon: faPencil,
        link: newThreadLink,
        color: "white",
      }}
      contextMenu={{
        icons: [
          {
            id: "pinned",
            icon: faThumbTack,
            color: boardMetadata.pinned ? "white" : "#2e2e30",
          },
          {
            id: "muted",
            icon: boardMetadata.muted ? faVolumeXmark : faVolumeHigh,
            color: boardMetadata.muted ? "#2e2e30" : "white",
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
        withNotification={{
          icon: faCertificate,
          color: DefaultTheme.DEFAULT_ACCENT_COLOR,
        }}
        link={{ onClick: () => {} }}
        position="right"
      />
      <BottomBar.Button
        key="jump down"
        icon={{ icon: faAnglesDown }}
        withNotification={{
          icon: faCertificate,
          color: DefaultTheme.DEFAULT_ACCENT_COLOR,
        }}
        link={{ onClick: () => {} }}
        position="right"
      />
    </BottomBar>
  );
};

export default withEditors(BoardBottomBar);
