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
