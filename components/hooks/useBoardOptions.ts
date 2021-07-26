import React from "react";

import {
  faCommentSlash,
  faEdit,
  faThumbtack,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { DropdownProps } from "@bobaboard/ui-components/dist/common/DropdownListMenu";
import { useAuth } from "../../components/Auth";
import { useBoardsContext } from "../boards/BoardContext";
import {
  useDismissBoardNotifications,
  useMuteBoard,
  usePinBoard,
} from "../../components/hooks/queries/board";

export enum BoardOptions {
  DISMISS_NOTIFICATIONS = "DISMISS_NOTIFICATIONS",
  PIN = "PIN",
  EDIT = "EDIT",
  MUTE = "MUTE",
}

// TODO: figure out why link is typed as "any" here
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
  pinnedOrder: number | null,
  callback: (pin: boolean) => void
): OptionType => ({
  icon: faThumbtack,
  name: pinnedOrder ? "Unpin" : "Pin",
  link: {
    onClick: () => callback(!pinnedOrder),
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
  slug,
  callbacks,
}: {
  options: BoardOptions[];
  slug: string;
  callbacks?: {
    editSidebar?: (edit: boolean) => void;
  };
}): DropdownProps["options"] | undefined => {
  const { boardsData } = useBoardsContext();
  const { isLoggedIn } = useAuth();

  const setBoardPinned = usePinBoard();
  const dismissNotifications = useDismissBoardNotifications();
  const setBoardMuted = useMuteBoard();
  const { refetch: refetchNotifications } = useBoardsContext();

  const dropdownOptions = React.useMemo(() => {
    const getOption = (option: BoardOptions) => {
      switch (option) {
        case BoardOptions.DISMISS_NOTIFICATIONS:
          if (!isLoggedIn || !boardsData?.[slug]) {
            return null;
          }
          return getDismissNotificationsOption(() =>
            dismissNotifications(
              { slug },
              {
                onSuccess: () => {
                  refetchNotifications();
                },
              }
            )
          );
        case BoardOptions.MUTE:
          if (!isLoggedIn || !boardsData?.[slug]) {
            return null;
          }
          return getMuteBoardOptions(boardsData?.[slug].muted, (mute) =>
            setBoardMuted(
              { slug, mute },
              {
                onSuccess: () => {
                  refetchNotifications();
                },
              }
            )
          );
        case BoardOptions.PIN:
          if (!isLoggedIn || !boardsData?.[slug]) {
            return null;
          }
          return getPinBoardOption(boardsData?.[slug].pinnedOrder, (pin) =>
            setBoardPinned({
              slug,
              pin,
            })
          );
        case BoardOptions.EDIT:
          if (
            !isLoggedIn ||
            !boardsData?.[slug]?.permissions?.canEditBoardData ||
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
    slug,
    boardsData,
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
