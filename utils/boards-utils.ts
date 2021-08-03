import moment from "moment";

import debug from "debug";
import { BoardSummary } from "types/Types";
import { NotificationsType } from "components/hooks/queries/notifications";
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
  boardsNotifications: NotificationsType["realmBoards"];
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
        boardsNotifications[board.slug]?.lastUpdateFromOthersAt &&
        (!isLoggedIn || boardsNotifications[board.slug].hasNotifications)
    )
    .sort((b1, b2) => {
      const lastUpdateB1 = moment.utc(
        boardsNotifications[b1.slug].lastUpdateFromOthersAt
      );
      const lastUpdateB2 = moment.utc(
        boardsNotifications[b2.slug].lastUpdateFromOthersAt
      );
      if (lastUpdateB1.isBefore(lastUpdateB2)) {
        return 1;
      }
      if (lastUpdateB1.isAfter(lastUpdateB2)) {
        return -1;
      }
      return 0;
    });

  return {
    recentBoards: recentBoards.filter((b) =>
      maybeApplyBoardsFilter(b, boardsFilter)
    ),
    allBoards: allBoards.filter((b) => maybeApplyBoardsFilter(b, boardsFilter)),
  };
};
