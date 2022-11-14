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
  PostData,
  RealmPermissions,
  RealmType,
  ThreadSummaryType,
} from "types/Types";
import { PostOptions, usePostOptions } from "components/options/usePostOptions";
import {
  REALM_QUERY_KEY,
  useBoardSummary,
  useCurrentRealmBoardId,
  useRealmPermissions,
} from "contexts/RealmContext";
import {
  ThreadViewMode,
  useThreadViewContext,
} from "contexts/ThreadViewContext";
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
import { getViewModeIcon } from "components/editors/utils";
import { useAuth } from "components/Auth";
import { useBeamToElement } from "components/hooks/useBeamToElement";
import { useBoardMetadata } from "queries/board";
import { useDisplayManager } from "components/hooks/useDisplayMananger";
import { useThreadCollapseManager } from "./useCollapseManager";
import { useThreadContext } from "./ThreadContext";

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
  const {
    threadRoot,
    isFetching: isFetchingThread,
    muted,
    hidden,
    defaultView,
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
  const { currentThreadViewMode } = useThreadViewContext();
  const collapseManager = useThreadCollapseManager();
  const displayManager = useDisplayManager(collapseManager);
  const { canBeam, onBeamToElement, loading } = useBeamToElement(
    displayManager,
    boardMetadata?.accentColor
  );
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
