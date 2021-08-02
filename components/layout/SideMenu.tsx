import React from "react";
import {
  SideMenu as LibrarySideMenu,
  SideMenuHandler,
} from "@bobaboard/ui-components";
import {
  faCommentSlash,
  faTh,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { dismissAllNotifications } from "../../utils/queries";
import { useMutation, useQueryClient } from "react-query";
import { usePageDetails } from "utils/router-utils";
import { useAuth } from "components/Auth";
import {
  NotificationsType,
  useNotifications,
} from "components/hooks/queries/notifications";
import { useBoardContext } from "../boards/BoardContext";
import { useRealmBoards } from "contexts/RealmContext";
import { processBoardsUpdates } from "utils/boards-utils";

import debug from "debug";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { BoardSummary } from "types/Types";
const log = debug("bobafrontend:SideMenu-log");

const MAX_UNREAD_BOARDS_DISPLAY = 4;

const makeUiBoard = ({
  board,
  link,
  notifications,
}: {
  board: BoardSummary;
  notifications: NotificationsType["realmBoards"];
  link: {
    onClick: () => void;
    href: string;
  };
}) => ({
  slug: board.slug.replace("_", " "),
  avatar: board.avatarUrl,
  description: board.tagline,
  color: board.accentColor,
  lastUpdate: notifications[board.slug]?.lastUpdateFromOthersAt,
  updates: !!notifications[board.slug]?.hasNotifications,
  outdated: !!notifications[board.slug]?.notificationsOutdated,
  muted: board.muted,
  link,
});

const SideMenu = () => {
  const [boardsFilter, setBoardsFilter] = React.useState("");
  const { isPending: isUserPending, isLoggedIn } = useAuth();
  const { slug, threadId } = usePageDetails();
  const queryClient = useQueryClient();
  const boardData = useBoardContext(slug || "");
  const { mutate: dismissNotifications } = useMutation(
    dismissAllNotifications,
    {
      onSuccess: () => {
        log(`Successfully dismissed all notifications. Refetching...`);
        queryClient.invalidateQueries(["allBoardsData", { isLoggedIn }]);
        if (slug) {
          queryClient.invalidateQueries(["boardActivityData", { slug }]);
        }
        if (threadId) {
          queryClient.invalidateQueries(["threadData", { threadId }]);
        }
      },
    }
  );
  const { realmBoardsNotifications, notificationsFetched } = useNotifications();
  const realmBoards = useRealmBoards();
  const { getLinkToBoard } = useCachedLinks();
  const onBoardChange = React.useCallback(
    (slug) => {
      queryClient.refetchQueries(["boardActivityData", { slug }]);
    },
    [queryClient]
  );
  const { recentBoards, allBoards } = React.useMemo(() => {
    const { recentBoards, allBoards } = processBoardsUpdates({
      boardsData: realmBoards,
      boardsNotifications: realmBoardsNotifications,
      boardsFilter,
      isLoggedIn,
    });

    return {
      recentBoards: recentBoards.map((board) =>
        makeUiBoard({
          board,
          notifications: realmBoardsNotifications,
          link: getLinkToBoard(board.slug, onBoardChange),
        })
      ),
      allBoards: allBoards.map((board) =>
        makeUiBoard({
          board,
          notifications: realmBoardsNotifications,
          link: getLinkToBoard(board.slug, onBoardChange),
        })
      ),
    };
  }, [
    boardsFilter,
    realmBoards,
    isLoggedIn,
    realmBoardsNotifications,
    onBoardChange,
    getLinkToBoard,
  ]);

  return (
    <LibrarySideMenu
      menuOptions={React.useMemo(
        () =>
          isLoggedIn
            ? [
                {
                  icon: faCommentSlash,
                  name: "Dismiss notifications",
                  link: { onClick: dismissNotifications },
                },
              ]
            : [],
        [isLoggedIn, dismissNotifications]
      )}
      showPinned={isUserPending || isLoggedIn}
      onFilterChange={setBoardsFilter}
      currentBoardSlug={slug}
    >
      {(isUserPending || isLoggedIn) && (
        <LibrarySideMenu.BoardsMenuSection
          key="recent-unreads"
          title={
            // TODO: this board is hidden cause the last update data
            // comes from the cache for logged out users, which
            // means we can't show them in order of update
            isUserPending || isLoggedIn ? "recent unreads" : "recent updates"
          }
          icon={faClock}
          boards={recentBoards.filter(
            (board, index) => index < MAX_UNREAD_BOARDS_DISPLAY
          )}
          emptyTitle="Congratulations!"
          emptyDescription="You read 'em all."
          placeholdersHeight={
            isUserPending || notificationsFetched
              ? MAX_UNREAD_BOARDS_DISPLAY
              : 0
          }
          accentColor={boardData?.accentColor}
          loading={isUserPending || (isLoggedIn && !notificationsFetched)}
        />
      )}
      <LibrarySideMenu.BoardsMenuSection
        key="all-boards"
        title="all boards"
        icon={faTh}
        boards={allBoards}
        emptyTitle="There's no board here."
        emptyDescription="Somehow, that feels wrong."
      />
    </LibrarySideMenu>
  );
};
export default SideMenu;
