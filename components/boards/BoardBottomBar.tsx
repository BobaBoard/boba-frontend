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

import { BoardParams } from "pages/[boardId]";
import React from "react";
import { RealmPermissions } from "types/Types";
import { useAuth } from "components/Auth";
import { useBeamToFeedElement } from "components/hooks/useBeamToFeedElement";
import { useBoardActivity } from "queries/board-feed";
import { useBoardMetadata } from "queries/board";
import { useNotifications } from "queries/notifications";
import { useQueryParams } from "use-query-params";
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
  const { id: realmId, realmPermissions } = useRealmContext();
  const { realmBoardsNotifications } = useNotifications({
    realmId,
  });
  const { boardMetadata } = useBoardMetadata({
    boardId,
  });
  const { isLoggedIn } = useAuth();
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

  const [params] = useQueryParams(BoardParams);
  const {
    canBeamToNext,
    onBeamToNext,
    canBeamToPrevious,
    onBeamToPrevious,
    loadingNext,
    loadingPrevious,
    resetBeamIndex,
  } = useBeamToFeedElement({
    feed: useBoardActivity({
      boardId,
      categoryFilter: params.filter,
    }),
    accentColor: boardMetadata?.accentColor,
  });

  React.useEffect(() => {
    resetBeamIndex();
    // Note: resetBeamIndex will never change cause it's been declared with
    // useCallback and no dependency. If it did, this may need to be a more
    // complex condition.
  }, [params, resetBeamIndex]);

  if (!boardMetadata) {
    return null;
  }

  const canCreateThread = realmPermissions.includes(
    RealmPermissions.CREATE_THREAD_ON_REALM
  );
  return (
    <BottomBar
      accentColor={boardMetadata.accentColor}
      centerButton={
        canCreateThread
          ? {
              icon: faPencil,
              link: newThreadLink,
              color: "white",
            }
          : undefined
      }
      contextMenu={{
        icons: isLoggedIn
          ? [
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
            ]
          : [],
        options: isLoggedIn ? boardOptions : [],
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
