import { PinnedBoardsMenu } from "@bobaboard/ui-components";
import { usePinnedBoards } from "../hooks/queries/pinned-boards";
import {
  useInvalidateNotifications,
  useNotifications,
} from "../hooks/queries/notifications";

import debug from "debug";
import { useQueryClient } from "react-query";
import React from "react";
const log = debug("bobafrontend:PinnedMenu-log");
import { useCachedLinks } from "../hooks/useCachedLinks";
import { usePageDetails } from "utils/router-utils";

const PinnedMenu = () => {
  const { getLinkToBoard } = useCachedLinks();
  const { data: pinnedBoards } = usePinnedBoards();
  const refetchNotifications = useInvalidateNotifications();
  const { pinnedBoardsNotifications } = useNotifications();
  const queryClient = useQueryClient();
  const { slug } = usePageDetails();
  const onBoardChange = React.useCallback(
    (nextSlug) => {
      // layoutRef.current?.closeSideMenu();
      if (nextSlug == slug) {
        log("Detected switch to same board. Refetching activity data.");
        queryClient.refetchQueries(["boardActivityData", { slug: nextSlug }]);
      }
      refetchNotifications();
      // refetch();
    },
    [queryClient, slug, refetchNotifications]
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
    <PinnedBoardsMenu boards={processedPinnedBoards} currentBoardSlug={slug} />
  );
};

export default PinnedMenu;
