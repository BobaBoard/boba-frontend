import { BoardType } from "@bobaboard/ui-components/dist/types";
import moment from "moment";

import debug from "debug";
const info = debug("bobafrontend:board-utils-info");

type BoardUpdateData = BoardType & {
  lastUpdate: Date | undefined;
  pinnedOrder: number | null;
};

const maybeApplyBoardsFilter = ({ slug }: BoardUpdateData, filter: string) => {
  return filter == "" || slug.toLowerCase().includes(filter.toLowerCase());
};

export const processBoardsUpdates = (
  boardsData: { [slug: string]: BoardUpdateData },
  boardsFilter: string,
  isLoggedIn: boolean
) => {
  info(`Processing board updates: `, boardsData);
  let recentBoards: BoardUpdateData[] = [];
  let allBoards: BoardUpdateData[] = [];
  const availableBoards = Object.values(boardsData);
  if (!availableBoards.length) {
    return { recentBoards, allBoards, hasUpdates: false };
  }

  allBoards = availableBoards.sort((b1, b2) => b1.slug.localeCompare(b2.slug));

  recentBoards = allBoards
    .filter((board) => board.lastUpdate && (!isLoggedIn || !!board.updates))
    .sort((b1, b2) => {
      if (moment.utc(b1.lastUpdate).isBefore(moment.utc(b2.lastUpdate))) {
        return 1;
      }
      if (moment.utc(b1.lastUpdate).isAfter(moment.utc(b2.lastUpdate))) {
        return -1;
      }
      return 0;
    });

  return {
    recentBoards: recentBoards.filter((b) =>
      maybeApplyBoardsFilter(b, boardsFilter)
    ),
    allBoards: allBoards.filter((b) => maybeApplyBoardsFilter(b, boardsFilter)),
    hasUpdates: allBoards.some((board) => board.updates),
    isOutdated: allBoards.every((board) => !board.updates || board.outdated),
  };
};
