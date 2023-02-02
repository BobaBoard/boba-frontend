import { BoardSummary, UserNotifications } from "types/Types";

import { compareDesc } from "date-fns";
import debug from "debug";

const info = debug("bobafrontend:board-utils-info");

const maybeApplyBoardsFilter = ({ slug }: BoardSummary, filter: string) => {
  return filter == "" || slug.toLowerCase().includes(filter.toLowerCase());
};

export const processBoardsUpdates = ({
  boardsData,
  boardsNotifications,
  boardsFilter,
  isLoggedIn,
}: {
  boardsData: BoardSummary[];
  boardsNotifications: UserNotifications["realmBoards"];
  boardsFilter: string;
  isLoggedIn: boolean;
}) => {
  info(`Processing board updates: `, boardsData);
  const allBoards = [...boardsData].sort((b1, b2) =>
    b1.slug.localeCompare(b2.slug)
  );

  const recentBoards = allBoards
    .filter(
      (board) =>
        boardsNotifications[board.id]?.lastActivityFromOthersAt &&
        (!isLoggedIn || boardsNotifications[board.id].hasUpdates)
    )
    .sort((b1, b2) =>
      compareDesc(
        boardsNotifications[b1.id].lastActivityFromOthersAt!,
        boardsNotifications[b2.id].lastActivityFromOthersAt!
      )
    );

  return {
    recentBoards: recentBoards.filter((b) =>
      maybeApplyBoardsFilter(b, boardsFilter)
    ),
    allBoards: allBoards.filter((b) => maybeApplyBoardsFilter(b, boardsFilter)),
  };
};
