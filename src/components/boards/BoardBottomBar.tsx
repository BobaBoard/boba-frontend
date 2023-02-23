import { BoardMetadata, RealmPermissions } from "types/Types";
import { BoardOptions, useBoardOptions } from "../hooks/useBoardOptions";
import { BoardPageDetails, usePageDetails } from "utils/router-utils";
import {
  EditorActions,
  useEditorsDispatch,
} from "components/core/editors/EditorsContext";
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

import { BottomBar } from "@bobaboard/ui-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import chroma from "chroma-js";
import { useAuth } from "components/Auth";
import { useBeamToFeedElement } from "components/hooks/useBeamToFeedElement";
import { useBoardActivity } from "lib/api/hooks/board-feed";
import { useBoardMetadata } from "lib/api/hooks/board";
import { useFilterableContext } from "components/core/feeds/FilterableContext";
import { useNotifications } from "lib/api/hooks/notifications";
import { withEditors } from "components/core/editors/withEditors";

export interface BoardBottomBarProps {
  onCompassClick: () => void;
}

const BoardInfoPanel = ({
  boardMetadata,
}: {
  boardMetadata: BoardMetadata;
}) => {
  const { id: realmId } = useRealmContext();
  const { realmBoardsNotifications } = useNotifications({
    realmId,
  });
  const boardNotifications = realmBoardsNotifications[boardMetadata.id];
  const { isLoggedIn } = useAuth();

  if (!boardNotifications || !isLoggedIn) {
    return null;
  }

  const notificationColor = boardNotifications.hasUpdates
    ? boardNotifications.isOutdated
      ? chroma(boardMetadata?.accentColor).alpha(0.5).css()
      : boardMetadata?.accentColor
    : "#2e2e30";
  const notificationsText = !boardNotifications.hasUpdates
    ? "You read all the threads in this board."
    : boardNotifications.isOutdated
    ? "No new threads since you got here."
    : "The board has new updates! Refresh to see them.";
  return (
    <aside>
      <FontAwesomeIcon icon={faCertificate} color={notificationColor} />
      {notificationsText}
      <style jsx>
        {`
          aside {
            padding: 10px 15px;
            border-bottom: 2px dashed ${boardMetadata?.accentColor};
            margin-bottom: 5px;
            display: flex;
            gap: 10px;
            align-items: center;
            max-width: max(250px, 100%);
          }
        `}
      </style>
    </aside>
  );
};

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

  const { activeCategories } = useFilterableContext();
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
      categoryFilter: activeCategories,
    }),
    accentColor: boardMetadata?.accentColor,
  });

  React.useEffect(() => {
    resetBeamIndex();
    // Note: resetBeamIndex will never change cause it's been declared with
    // useCallback and no dependency. If it did, this may need to be a more
    // complex condition.
  }, [activeCategories, resetBeamIndex]);

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
              "aria-label": "create new thread",
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
                      ? chroma(boardMetadata?.accentColor).alpha(0.5).css()
                      : boardMetadata?.accentColor
                    : "#2e2e30",
              },
            ]
          : [],
        options: isLoggedIn ? boardOptions : [],
        info: boardMetadata ? (
          <BoardInfoPanel boardMetadata={boardMetadata} />
        ) : undefined,
      }}
    >
      <BottomBar.Button
        id="compass"
        icon={{ icon: faCompass }}
        link={{ onClick: props.onCompassClick }}
        position="left"
        desktopOnly
      />
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
    </BottomBar>
  );
};

export default withEditors(BoardBottomBar);
