import { QueryClient } from "react-query";
import { BoardSummary, RealmType, BoardMetadata } from "../types/Types";

import { BOARD_METADATA_KEY } from "../components/hooks/queries/board";
import {
  PinnedBoardType,
  PINNED_BOARDS_QUERY_KEY,
} from "../components/hooks/queries/pinned-boards";

// import debug from "debug";
// const error = debug("bobafrontend:cache:board-error");
// const log = debug("bobafrontend:cache:board-log");

export const getBoardSummaryInCache = (
  queryClient: QueryClient,
  { boardId }: { boardId: string }
) => {
  const boardsData = queryClient.getQueryData<{ boards: BoardSummary[] }>(
    ["realmData"],
    {
      exact: false,
    }
  );
  if (!boardsData) {
    return null;
  }
  return boardsData.boards.find((board) => board.id === boardId) || null;
};

export const setBoardSummaryInCache = (
  queryClient: QueryClient,
  { boardId }: { boardId: string },
  transform: (summary: BoardSummary) => BoardSummary
) => {
  queryClient.setQueriesData(
    {
      queryKey: "realmData",
      exact: false,
    },
    (data: RealmType) => {
      const containsBoard = data.boards.find(
        (realmBoard) => realmBoard.id == boardId
      );
      if (!containsBoard) {
        return data;
      }
      return {
        ...data,
        boards: data.boards.map((realmBoard) => {
          if (realmBoard.id !== boardId) {
            return realmBoard;
          }
          return transform({ ...realmBoard });
        }),
      };
    }
  );
};

export const setBoardMetadataInCache = (
  queryClient: QueryClient,
  { boardId }: { boardId: string },
  transform: (summary: BoardMetadata) => BoardMetadata
) => {
  queryClient.setQueriesData(
    {
      queryKey: [BOARD_METADATA_KEY, { boardId }],
      exact: false,
    },
    (data: BoardMetadata) => {
      const transformedData = transform({ ...data });
      return transformedData;
    }
  );
};

export const setPinnedBoardInCache = (
  queryClient: QueryClient,
  { boardId }: { boardId: string },
  transform: (pinnedBoard: PinnedBoardType) => PinnedBoardType
) => {
  queryClient.setQueriesData(
    {
      queryKey: PINNED_BOARDS_QUERY_KEY,
    },
    (data: Record<string, PinnedBoardType>) => {
      const pinnedBoard = data[boardId];
      if (!pinnedBoard) {
        return data;
      }
      const transformedData = transform({ ...pinnedBoard });
      return {
        ...data,
        [boardId]: transformedData,
      };
    }
  );
};

export const addPinnedBoardInCache = (
  queryClient: QueryClient,
  { board }: { board: BoardSummary }
) => {
  queryClient.setQueriesData(
    {
      queryKey: PINNED_BOARDS_QUERY_KEY,
    },
    (data: Record<string, PinnedBoardType>) => {
      const currentBoardData = data[board.id];
      if (currentBoardData) {
        return data;
      }
      const currentMaxIndex =
        Math.max(...Object.values(data).map((board) => board.pinnedIndex)) || 0;
      const newData: PinnedBoardType = {
        ...board,
        pinned: true,
        pinnedIndex: currentMaxIndex + 1,
      };
      return {
        ...data,
        [newData.id]: newData,
      };
    }
  );
};

export const removePinnedBoardInCache = (
  queryClient: QueryClient,
  { boardId }: { boardId: string }
) => {
  queryClient.setQueriesData(
    {
      queryKey: PINNED_BOARDS_QUERY_KEY,
    },
    (data: Record<string, PinnedBoardType>) => {
      if (!data[boardId]) {
        return data;
      }
      const newData = { ...data };
      delete newData[boardId];
      return newData;
    }
  );
};

export const setBoardMutedInCache = (
  queryClient: QueryClient,
  {
    slug,
    mute,
  }: {
    slug: string;
    mute: boolean;
  }
) => {
  setBoardMetadataInCache(queryClient, { boardId: slug }, (boardMetadata) => {
    boardMetadata.muted = mute;
    return boardMetadata;
  });
  setPinnedBoardInCache(queryClient, { boardId: slug }, (board) => {
    board.muted = mute;
    return board;
  });
  setBoardSummaryInCache(queryClient, { boardId: slug }, (board) => {
    board.muted = mute;
    return board;
  });
};

export const setBoardPinnedInCache = (
  queryClient: QueryClient,
  {
    boardId,
    pin,
  }: {
    boardId: string;
    pin: boolean;
  }
) => {
  setBoardMetadataInCache(queryClient, { boardId }, (boardMetadata) => {
    boardMetadata.pinned = pin;
    return boardMetadata;
  });
  if (pin) {
    const boardSummary = getBoardSummaryInCache(queryClient, { boardId });
    boardSummary && addPinnedBoardInCache(queryClient, { board: boardSummary });
  } else {
    removePinnedBoardInCache(queryClient, { boardId });
  }
  setBoardSummaryInCache(queryClient, { boardId }, (board) => {
    board.pinned = pin;
    return board;
  });
};
