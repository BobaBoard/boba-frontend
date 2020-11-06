import moment from "moment";

// TODO: type this
export const processBoardsUpdates = (
  boardsData: { [slug: string]: any },
  boardsFilter: string
) => {
  let recentBoards: any[] = [];
  let pinnedBoards: any[] = [];
  let allBoards: any[] = [];
  let hasUpdates = false;
  const availableBoards = Object.values(boardsData);
  if (!availableBoards.length) {
    return { recentBoards, pinnedBoards, allBoards, hasUpdates };
  }

  allBoards = availableBoards.sort((b1, b2) => b1.slug.localeCompare(b2.slug));

  recentBoards = allBoards
    .filter((board) => board.updates)
    .sort((b1, b2) => {
      if (moment.utc(b1.lastUpdate).isBefore(moment.utc(b2.lastUpdate))) {
        return -1;
      }
      if (moment.utc(b1.lastUpdate).isAfter(moment.utc(b2.lastUpdate))) {
        return 1;
      }
      return 0;
    });

  pinnedBoards = allBoards
    .filter((board) => board.pinned)
    .sort(
      (b1, b2) =>
        (boardsData[b1.slug]?.pinnedOrder as number) -
        (boardsData[b2.slug]?.pinnedOrder as number)
    );

  return {
    recentBoards: recentBoards.filter(
      ({ slug }) => boardsFilter == "" || slug.includes(boardsFilter)
    ),
    pinnedBoards: pinnedBoards.filter(
      ({ slug }) => boardsFilter == "" || slug.includes(boardsFilter)
    ),
    allBoards: allBoards.filter(
      ({ slug }) => boardsFilter == "" || slug.includes(boardsFilter)
    ),
    hasUpdates: allBoards.some((board) => board.updates),
  };
};
