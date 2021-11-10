import {
  faCommentSlash,
  faEdit,
  faThumbtack,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import {
  useBoardMetadata,
  useDismissBoardNotifications,
  useMuteBoard,
  usePinBoard,
} from "queries/board";

import { BoardPermissions } from "types/Types";
import { DropdownProps } from "@bobaboard/ui-components/dist/common/DropdownListMenu";
import React from "react";
import { useAuth } from "components/Auth";
import { useInvalidateNotifications } from "queries/notifications";

export enum BoardOptions {
  DISMISS_NOTIFICATIONS = "DISMISS_NOTIFICATIONS",
  PIN = "PIN",
  EDIT = "EDIT",
  MUTE = "MUTE",
}

type OptionType = NonNullable<DropdownProps["options"]>[number];
const getMuteBoardOptions = (
  muted: boolean,
  callback: (muted: boolean) => void
): OptionType => ({
  icon: muted ? faVolumeUp : faVolumeMute,
  name: muted ? "Unmute" : "Mute",
  link: {
    onClick: () => callback(!muted),
  },
});

const getPinBoardOption = (
  pinned: boolean,
  callback: (pin: boolean) => void
): OptionType => ({
  icon: faThumbtack,
  name: pinned ? "Unpin" : "Pin",
  link: {
    onClick: () => callback(!pinned),
  },
});

const getDismissNotificationsOption = (callback: () => void): OptionType => ({
  icon: faCommentSlash,
  name: "Dismiss notifications",
  link: {
    onClick: callback,
  },
});

const getEditOption = (callback: () => void): OptionType => ({
  icon: faEdit,
  name: "Edit Board",
  link: {
    onClick: callback,
  },
});

const useBoardOptions = ({
  options,
  boardId,
  callbacks,
}: {
  options: BoardOptions[];
  boardId: string | null;
  callbacks?: {
    editSidebar?: (edit: boolean) => void;
  };
}): DropdownProps["options"] | undefined => {
  const { boardMetadata } = useBoardMetadata({ boardId });
  const { isLoggedIn } = useAuth();

  const setBoardPinned = usePinBoard();
  const dismissNotifications = useDismissBoardNotifications();
  const setBoardMuted = useMuteBoard();
  const refetchNotifications = useInvalidateNotifications();

  const dropdownOptions = React.useMemo(() => {
    const getOption = (option: BoardOptions) => {
      switch (option) {
        case BoardOptions.DISMISS_NOTIFICATIONS:
          if (!isLoggedIn || !boardMetadata || !boardId) {
            return null;
          }
          return getDismissNotificationsOption(() =>
            dismissNotifications(
              { boardId },
              {
                onSuccess: () => {
                  refetchNotifications();
                },
              }
            )
          );
        case BoardOptions.MUTE:
          if (!isLoggedIn || !boardMetadata || !boardId) {
            return null;
          }
          return getMuteBoardOptions(!!boardMetadata.muted, (mute) =>
            setBoardMuted(
              { boardId, mute },
              {
                onSuccess: () => {
                  refetchNotifications();
                },
              }
            )
          );
        case BoardOptions.PIN:
          if (!isLoggedIn || !boardMetadata || !boardId) {
            return null;
          }
          return getPinBoardOption(!!boardMetadata.pinned, (pin) =>
            setBoardPinned({
              boardId,
              pin,
            })
          );
        case BoardOptions.EDIT:
          if (
            !isLoggedIn ||
            !boardMetadata?.permissions?.boardPermissions.includes(
              BoardPermissions.editMetadata
            ) ||
            !callbacks?.editSidebar
          ) {
            return null;
          }
          return getEditOption(() => callbacks.editSidebar?.(true));
      }
    };
    return options.map(getOption).filter((option) => option != null);
  }, [
    options,
    boardMetadata,
    boardId,
    callbacks,
    dismissNotifications,
    refetchNotifications,
    isLoggedIn,
    setBoardMuted,
    setBoardPinned,
  ]);

  return dropdownOptions.length
    ? (dropdownOptions as DropdownProps["options"])
    : undefined;
};

export { useBoardOptions };
