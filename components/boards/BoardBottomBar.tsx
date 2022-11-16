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

import React from "react";
import { useBeamToFeedElement } from "components/hooks/useBeamToFeedElement";
import { useBoardActivity } from "queries/board-feed";
import { useBoardMetadata } from "queries/board";
import { useNotifications } from "queries/notifications";
import { withEditors } from "components/editors/withEditors";

export interface BoardBottomBarProps {
  onCompassClick: () => void;
}

const BoardParams = {
  filter: ArrayParam,
};

const BoardBottomBar = (props: BoardBottomBarProps) => {
  const { slug } = usePageDetails<BoardPageDetails>();
  if (!slug) {
    throw new Error("Using BoardBottomBar outside of Board page.");
  }
  const boardId = useCurrentRealmBoardId({ boardSlug: slug });
  const { id: realmId } = useRealmContext();
  const { realmBoardsNotifications } = useNotifications({
    realmId,
  });
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

  const [{ filter: categoryFilter }] = useQueryParams(BoardParams);
  const feedData = useBoardActivity({
    boardId,
    categoryFilter,
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
    accentColor: boardMetadata?.accentColor,
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
            color: boardMetadata.muted ? "red" : "#2e2e30",
          },
          {
            id: "updates",
            icon: faCertificate,
            color:
              boardId && realmBoardsNotifications[boardId]?.hasUpdates
                ? boardId && realmBoardsNotifications[boardId]?.isOutdated
                  ? DefaultTheme.NOTIFICATIONS_OUTDATED_COLOR
                  : DefaultTheme.NOTIFICATIONS_NEW_COLOR
                : "#2e2e30",
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

export default withEditors(BoardBottomBar);
