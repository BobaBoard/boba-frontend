import { PostOptions, usePostOptions } from "components/options/usePostOptions";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import {
  faAnglesDown,
  faAnglesUp,
  faCertificate,
  faCompass,
  faEye,
  faEyeSlash,
  faPlusSquare,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useThreadEditors, withEditors } from "components/editors/withEditors";

import { BottomBar } from "@bobaboard/ui-components";
import React from "react";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { getViewModeIcon } from "components/editors/utils";
import { useAuth } from "components/Auth";
import { useBeamToThreadElement } from "components/hooks/useBeamToThreadElement";
import { useBoardMetadata } from "queries/board";
import { useCurrentRealmBoardId } from "contexts/RealmContext";
import { useDisplayManager } from "components/hooks/useDisplayMananger";
import { useThreadCollapseManager } from "./useCollapseManager";
import { useThreadContext } from "./ThreadContext";
import { useThreadViewContext } from "contexts/ThreadViewContext";

export interface BoardBottomBarProps {
  onCompassClick: () => void;
}

const BoardBottomBar = (props: BoardBottomBarProps) => {
  const { slug, threadId } = usePageDetails<ThreadPageDetails>();
  const { isLoggedIn } = useAuth();
  if (!slug) {
    throw new Error("Using BoardBottomBar outside of Board page.");
  }
  const boardId = useCurrentRealmBoardId({ boardSlug: slug });
  const { boardMetadata } = useBoardMetadata({
    boardId,
  });
  const { threadRoot, muted, hidden, defaultView, newRepliesCount, isLoading } =
    useThreadContext();
  const { onNewContribution } = useThreadEditors();
  const newPostLink = React.useMemo(
    () => ({
      onClick: () => {
        threadRoot && onNewContribution(threadRoot.postId);
      },
    }),
    [onNewContribution, threadRoot]
  );
  const { currentThreadViewMode } = useThreadViewContext();
  const collapseManager = useThreadCollapseManager();
  const displayManager = useDisplayManager(collapseManager);
  const {
    canBeamToNext,
    onBeamToNext,
    canBeamToPrevious,
    onBeamToPrevious,
    loadingMore,
  } = useBeamToThreadElement(displayManager, boardMetadata?.accentColor);
  const threadOptions = usePostOptions({
    options: [
      PostOptions.COPY_THREAD_LINK,
      PostOptions.HIDE,
      PostOptions.MUTE,
      PostOptions.MARK_READ,
      PostOptions.OPEN_AS,
    ],
    isLoggedIn,
    data: {
      boardId,
      threadId,
      post: threadRoot!,
      currentView: defaultView!,
      hidden,
      muted,
    },
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
            color: hidden ? "red" : "#2e2e30",
          },
          {
            id: "muted",
            icon: muted ? faVolumeXmark : faVolumeHigh,
            color: muted ? "red" : "#2e2e30",
          },
          {
            id: "thread-type",
            icon: getViewModeIcon(currentThreadViewMode)!,
            color: "white",
          },
        ],
        options: threadOptions,
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
        icon={{
          icon: canBeamToPrevious ? faAnglesUp : faCircleXmark,
        }}
        withNotification={
          newRepliesCount > 0
            ? {
                icon: faCertificate,
                color: boardMetadata?.accentColor,
              }
            : undefined
        }
        link={{
          onClick: onBeamToPrevious,
        }}
        position="right"
        loading={isLoading}
        disabled={!canBeamToPrevious}
      />
      <BottomBar.Button
        key="jump down"
        icon={{
          icon: canBeamToNext ? faAnglesDown : faCircleXmark,
        }}
        withNotification={
          newRepliesCount > 0
            ? {
                icon: faCertificate,
                color: boardMetadata?.accentColor,
              }
            : undefined
        }
        link={{ onClick: onBeamToNext }}
        position="right"
        disabled={!canBeamToNext}
        loading={isLoading || loadingMore}
      />
    </BottomBar>
  );
};

export default withEditors(BoardBottomBar);
