import { PageTypes, usePageDetails } from "utils/router-utils";
import { faInbox, faRss, faThumbtack } from "@fortawesome/free-solid-svg-icons";
import {
  useInvalidateNotifications,
  useNotifications,
} from "../hooks/queries/notifications";

import { PinnedMenu as LibraryPinnedMenu } from "@bobaboard/ui-components";
import React from "react";
import debug from "debug";
import { useAuth } from "components/Auth";
import { useCachedLinks } from "../hooks/useCachedLinks";
import { usePinnedBoards } from "../hooks/queries/pinned-boards";
import { useRefetchBoardActivity } from "components/hooks/queries/board-activity";

const log = debug("bobafrontend:PinnedMenu-log");

const PinnedMenu = () => {
  const { getLinkToBoard, linkToFeed } = useCachedLinks();
  const { data: pinnedBoards } = usePinnedBoards();
  const refetchNotifications = useInvalidateNotifications();
  const { pinnedBoardsNotifications } = useNotifications();
  const refetchBoardActivity = useRefetchBoardActivity();
  const { slug, pageType } = usePageDetails();
  const { isLoggedIn } = useAuth();
  const onBoardChange = React.useCallback(
    (nextSlug) => {
      if (nextSlug == slug) {
        log("Detected switch to same board. Refetching activity data.");
        refetchBoardActivity({ slug: nextSlug });
      }
      refetchNotifications();
    },
    [slug, refetchNotifications, refetchBoardActivity]
  );

  const processedPinnedBoards = React.useMemo(() => {
    if (!pinnedBoards) {
      return [];
    }
    return Object.values(pinnedBoards)
      .map((board) => {
        return {
          slug: board.slug.replace("_", " "),
          avatar: `${board.avatarUrl}`,
          description: board.tagline,
          color: board.accentColor,
          muted: board.muted,
          link: getLinkToBoard(board.slug, onBoardChange),
          pinnedOrder: board.pinnedIndex,
          updates:
            pinnedBoardsNotifications[board.slug]?.hasNotifications || false,
          outdated:
            pinnedBoardsNotifications[board.slug]?.notificationsOutdated ||
            false,
        };
      })
      .sort((b1, b2) => (b1.pinnedOrder || 0) - (b2.pinnedOrder || 0));
  }, [pinnedBoards, pinnedBoardsNotifications, getLinkToBoard, onBoardChange]);
  return (
    <LibraryPinnedMenu>
      {isLoggedIn && (
        <LibraryPinnedMenu.Section
          icon={faRss}
          items={[
            // {
            //   id: "star",
            //   icon: faStar,
            //   link: linkToFeed,
            //   accentColor: "#f96680",
            //   withNotification: true,
            // },
            {
              id: PageTypes.FEED,
              icon: faInbox,
              link: linkToFeed,
              accentColor: "#f96680",
            },
          ]}
          currentItemId={pageType}
        />
      )}
      {processedPinnedBoards.length && (
        <LibraryPinnedMenu.Section
          icon={faThumbtack}
          items={processedPinnedBoards}
          currentItemId={slug}
        />
      )}
    </LibraryPinnedMenu>
  );
};

export default PinnedMenu;
