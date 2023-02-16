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
import { useCurrentRealmBoardId, useRealmContext } from "contexts/RealmContext";
import {
  useThreadEditors,
  withEditors,
} from "components/core/editors/withEditors";

import { BottomBar } from "@bobaboard/ui-components";
import React from "react";
import { RealmPermissions } from "types/Types";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { getViewModeIcon } from "components/core/editors/utils";
import { useAuth } from "components/Auth";
import { useBeamToThreadElement } from "components/hooks/useBeamToThreadElement";
import { useBoardMetadata } from "queries/board";
import { useDisplayManager } from "components/hooks/useDisplayMananger";
import { useThreadCollapseManager } from "./useCollapseManager";
import { useThreadContext } from "./ThreadContext";
import { useThreadViewContext } from "contexts/ThreadViewContext";

export interface ThreadBottomBarProps {
  onCompassClick: () => void;
}
const ThreadInfoPanel = () => {
  const { createdAt, lastActivityAt } = useThreadContext();
  const { slug } = usePageDetails<ThreadPageDetails>();
  const boardId = useCurrentRealmBoardId({ boardSlug: slug });
  const { boardMetadata } = useBoardMetadata({
    boardId,
  });

  return (
    <aside>
      <dl>
        <dt>Created on</dt>
        <dd>{createdAt?.toLocaleString()}</dd>
        <dt>Last updated</dt>
        <dd>{lastActivityAt?.toLocaleString()}</dd>
      </dl>
      <style jsx>
        {`
          aside {
            padding: 10px 20px;
            border-bottom: 2px dashed ${boardMetadata?.accentColor};
            margin-bottom: 5px;
            max-width: max(250px, 100%);
          }
          dl {
            margin: 0;
          }
          dt {
            font-size: var(--font-size-small);
            font-weight: bold;
          }
          dd {
            margin-left: 0;
            font-size: var(--font-size-regular);
          }
          dd:not(:last-child) {
            margin-bottom: 10px;
          }
        `}
      </style>
    </aside>
  );
};

const ThreadBottomBar = (props: ThreadBottomBarProps) => {
  const { slug, threadId } = usePageDetails<ThreadPageDetails>();
  const { isLoggedIn } = useAuth();
  if (!slug) {
    throw new Error("Using BoardBottomBar outside of Board page.");
  }
  const { realmPermissions } = useRealmContext();
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
      centerButton={
        realmPermissions.includes(RealmPermissions.POST_ON_REALM)
          ? {
              icon: faPlusSquare,
              link: newPostLink,
              color: "white",
              "aria-label": "new contribution",
            }
          : undefined
      }
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
        info: <ThreadInfoPanel key="info-panel" />,
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
        id="jump down"
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

export default withEditors(ThreadBottomBar);
