import { BoardType } from "@bobaboard/ui-components/dist/types";
import moment from "moment";

type BoardUpdateData = BoardType & {
  lastUpdate: Date | undefined;
  pinnedOrder: number | null;
};

const maybeApplyBoardsFilter = ({ slug }: BoardUpdateData, filter: string) => {
  return filter == "" || slug.toLowerCase().includes(filter.toLowerCase());
};

export const processBoardsUpdates = (
  boardsData: { [slug: string]: BoardUpdateData },
  boardsFilter: string
) => {
  let recentBoards: BoardUpdateData[] = [];
  let pinnedBoards: BoardUpdateData[] = [];
  let allBoards: BoardUpdateData[] = [];
  let hasUpdates = false;
  const availableBoards = Object.values(boardsData);
  if (!availableBoards.length) {
    return { recentBoards, pinnedBoards, allBoards, hasUpdates };
  }

  allBoards = availableBoards.sort((b1, b2) => b1.slug.localeCompare(b2.slug));

  recentBoards = allBoards
    .filter((board) => board.lastUpdate !== null && !!board.updates)
    .sort((b1, b2) => {
      if (moment.utc(b1.lastUpdate).isBefore(moment.utc(b2.lastUpdate))) {
        return 1;
      }
      if (moment.utc(b1.lastUpdate).isAfter(moment.utc(b2.lastUpdate))) {
        return -1;
      }
      return 0;
    });

  pinnedBoards = allBoards
    .filter((board) => board.pinnedOrder !== null)
    .sort((b1, b2) => (b1.pinnedOrder || 0) - (b2.pinnedOrder || 0));

  return {
    recentBoards: recentBoards.filter((b) =>
      maybeApplyBoardsFilter(b, boardsFilter)
    ),
    pinnedBoards: pinnedBoards.filter((b) =>
      maybeApplyBoardsFilter(b, boardsFilter)
    ),
    allBoards: allBoards.filter((b) => maybeApplyBoardsFilter(b, boardsFilter)),
    hasUpdates: allBoards.some((board) => board.updates),
    isOutdated: allBoards.every((board) => !board.updates || board.outdated),
  };
};
