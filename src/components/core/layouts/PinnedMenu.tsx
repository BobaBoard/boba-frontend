import { PageTypes, usePageDetails } from "utils/router-utils";
import { faInbox, faRss, faThumbtack } from "@fortawesome/free-solid-svg-icons";
import {
  useInvalidateNotifications,
  useNotifications,
} from "lib/api/hooks/notifications";
import { useRealmBoards, useRealmContext } from "contexts/RealmContext";

import { PinnedMenu as LibraryPinnedMenu } from "@bobaboard/ui-components";
import React from "react";
import debug from "debug";
import { useAuth } from "components/Auth";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { usePinnedBoards } from "lib/api/hooks/pinned-boards";
import { useRefetchBoardActivity } from "lib/api/hooks/board-feed";

const log = debug("bobafrontend:PinnedMenu-log");

const PinnedMenu = () => {
  const { getLinkToBoard, linkToFeed } = useCachedLinks();
  const { data: pinnedBoards } = usePinnedBoards();
  const refetchNotifications = useInvalidateNotifications();
  const { id: realmId } = useRealmContext();
  const { pinnedBoardsNotifications } = useNotifications({ realmId });
  const refetchBoardActivity = useRefetchBoardActivity();
  // TODO: see if we can add board id to page details
  const { slug, pageType } = usePageDetails();
  const { isLoggedIn } = useAuth();
  const boards = useRealmBoards();
  const onBoardChange = React.useCallback(
    (nextSlug) => {
      const nextBoardId = boards.find((board) => board.slug == slug)?.id;
      if (!nextBoardId) {
        // TODO: figure out why this happens with "null" when going from a
        // page with no boardId to a page with one.
        // toast.error(`Couldn't find id for board ${slug}`);
        return;
      }
      if (nextSlug == slug) {
        log("Detected switch to same board. Refetching activity data.");
        refetchBoardActivity({ boardId: nextBoardId });
      }
      refetchNotifications();
    },
    [slug, refetchNotifications, refetchBoardActivity, boards]
  );

  const processedPinnedBoards = React.useMemo(() => {
    if (!pinnedBoards) {
      return [];
    }
    return Object.values(pinnedBoards)
      .filter((board) => board.realmId === realmId)
      .map((board) => {
        return {
          slug: board.slug.replace("_", " "),
          avatar: `${board.avatarUrl}`,
          description: board.tagline,
          color: board.accentColor,
          muted: board.muted,
          link: getLinkToBoard(board.slug, onBoardChange),
          pinnedOrder: board.pinnedIndex,
          updates: pinnedBoardsNotifications[board.id]?.hasUpdates || false,
          outdated: pinnedBoardsNotifications[board.id]?.isOutdated || false,
        };
      })
      .sort((b1, b2) => (b1.pinnedOrder || 0) - (b2.pinnedOrder || 0));
  }, [
    pinnedBoards,
    pinnedBoardsNotifications,
    getLinkToBoard,
    onBoardChange,
    realmId,
  ]);
  return (
    <LibraryPinnedMenu>
      {isLoggedIn && (
        <LibraryPinnedMenu.Section
          icon={faRss}
          sectionId={"feeds"}
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
              icon: { icon: faInbox },
              link: linkToFeed,
              accentColor: "#f96680",
            },
          ]}
          currentItemId={pageType}
        />
      )}
      {processedPinnedBoards.length && (
        <LibraryPinnedMenu.Section
          sectionId={"pinned boards"}
          icon={faThumbtack}
          items={processedPinnedBoards}
          currentItemId={slug}
        />
      )}
    </LibraryPinnedMenu>
  );
};

export default PinnedMenu;
