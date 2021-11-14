import { BoardSummary, UserNotifications } from "types/Types";
import {
  faClock,
  faCommentSlash,
  faTh,
} from "@fortawesome/free-solid-svg-icons";
import {
  useInvalidateNotifications,
  useNotifications,
} from "queries/notifications";
import { useMutation, useQueryClient } from "react-query";

import { SideMenu as LibrarySideMenu } from "@bobaboard/ui-components";
import React from "react";
import { THREAD_QUERY_KEY } from "queries/thread";
import debug from "debug";
import { dismissAllNotifications } from "utils/queries";
import { processBoardsUpdates } from "utils/boards-utils";
import { useAuth } from "components/Auth";
import { useBoardSummaryBySlug } from "queries/board";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { usePageDetails } from "utils/router-utils";
import { useRealmBoards } from "contexts/RealmContext";
import { useRefetchBoardActivity } from "queries/board-feed";

const log = debug("bobafrontend:SideMenu-log");

const MAX_UNREAD_BOARDS_DISPLAY = 4;

const makeUiBoard = ({
  board,
  link,
  notifications,
}: {
  board: BoardSummary;
  notifications: UserNotifications["realmBoards"];
  link: {
    onClick: () => void;
    href: string;
  };
}) => ({
  slug: board.slug.replace("_", " "),
  avatar: board.avatarUrl,
  description: board.tagline,
  color: board.accentColor,
  lastUpdate: notifications[board.id]?.lastActivityAt,
  updates: !!notifications[board.id]?.hasUpdates,
  outdated: !!notifications[board.id]?.isOutdated,
  muted: board.muted,
  link,
});

const SideMenu = () => {
  const [boardsFilter, setBoardsFilter] = React.useState("");
  const { isPending: isUserPending, isLoggedIn } = useAuth();
  const { slug, threadId } = usePageDetails();
  const queryClient = useQueryClient();
  const boardData = useBoardSummaryBySlug(slug || "");
  const refetchBoardActivity = useRefetchBoardActivity();
  const refetchNotifications = useInvalidateNotifications();
  const { mutate: dismissNotifications } = useMutation(
    dismissAllNotifications,
    {
      onSuccess: () => {
        log(`Successfully dismissed all notifications. Refetching...`);
        refetchNotifications();
        refetchBoardActivity({ slug });
        if (threadId) {
          // TODO: swap this with method exported from query itself
          queryClient.invalidateQueries([THREAD_QUERY_KEY, { threadId }]);
        }
      },
    }
  );
  const { realmBoardsNotifications, notificationsFetched } = useNotifications();
  const realmBoards = useRealmBoards();
  const { getLinkToBoard } = useCachedLinks();
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
          link: getLinkToBoard(board.slug, (slug) => {
            refetchBoardActivity({ slug });
          }),
        })
      ),
      allBoards: allBoards.map((board) =>
        makeUiBoard({
          board,
          notifications: realmBoardsNotifications,
          link: getLinkToBoard(board.slug, (slug) => {
            refetchBoardActivity({ slug });
          }),
        })
      ),
    };
  }, [
    boardsFilter,
    realmBoards,
    isLoggedIn,
    realmBoardsNotifications,
    refetchBoardActivity,
    getLinkToBoard,
  ]);

  return (
    // Note: we don't need to add PinnedMenu in SideMenu cause Layout injects it directly
    // at smaller resolutions.
    // TODO: at some point it might be worth completely removing it from sidemenu.
    <LibrarySideMenu
      menuOptions={React.useMemo(
        () =>
          isLoggedIn
            ? [
                {
                  icon: faCommentSlash,
                  name: "Dismiss notifications",
                  link: { onClick: () => dismissNotifications() },
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
          placeholdersCount={
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
