import { BoardMetadata, BoardSummary, RealmType } from "types/Types";
import {
  PINNED_BOARDS_QUERY_KEY,
  PinnedBoardType,
} from "lib/api/hooks/pinned-boards";

import { BOARD_METADATA_KEY } from "lib/api/hooks/board";
import { QueryClient } from "react-query";
import { REALM_QUERY_KEY } from "contexts/RealmContext";

// import debug from "debug";
// const error = debug("bobafrontend:cache:board-error");
// const log = debug("bobafrontend:cache:board-log");

export const getBoardSummaryInCache = (
  queryClient: QueryClient,
  { boardId }: { boardId: string }
): BoardSummary | null => {
  const boardsData = queryClient.getQueryData<{ boards: BoardSummary[] }>(
    REALM_QUERY_KEY,
    {
      exact: false,
    }
  );
  const boardSummary =
    boardsData?.boards.find((board) => board.id === boardId) || null;
  if (boardSummary) {
    return boardSummary;
  }
  const boardMetadata = queryClient.getQueryData<BoardMetadata>(
    [BOARD_METADATA_KEY, { boardId }],
    {
      exact: false,
    }
  );
  if (boardMetadata) {
    const boardSummary = { ...boardMetadata };
    // We delete description even if non-optional. The result is a summary
    // so here we're removing all the extra in metadata.
    // @ts-expect-error
    delete boardSummary.descriptions;
    delete boardSummary.permissions;
    delete boardSummary.postingIdentities;
    delete boardSummary.accessories;
    return boardSummary;
  }

  return null;
};

export const setBoardSummaryInCache = (
  queryClient: QueryClient,
  { boardId }: { boardId: string },
  transform: (summary: BoardSummary) => BoardSummary
) => {
  queryClient.setQueriesData<RealmType | undefined>(
    {
      queryKey: REALM_QUERY_KEY,
      exact: false,
    },
    (data) => {
      const containsBoard = data?.boards.find(
        (realmBoard) => realmBoard.id == boardId
      );
      if (!containsBoard || !data) {
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

export const addBoardSummaryInCache = (
  queryClient: QueryClient,
  { realmSlug, summary }: { realmSlug: string; summary: BoardSummary }
) => {
  queryClient.setQueriesData<RealmType | undefined>(
    {
      queryKey: [REALM_QUERY_KEY, { realmSlug }],
      exact: false,
    },
    (data) => {
      if (!data) {
        return;
      }
      const newData = {
        ...data,
        boards: [...data.boards],
      };
      const boardIndex = data.boards.findIndex(
        (board) => board.id === summary.id
      );
      if (boardIndex !== -1) {
        newData.boards[boardIndex] = summary;
      } else {
        newData.boards.push(summary);
      }
      return newData;
    }
  );
};

export const setBoardMetadataInCache = (
  queryClient: QueryClient,
  { boardId }: { boardId: string },
  transform: (summary: BoardMetadata) => BoardMetadata
) => {
  queryClient.setQueriesData<BoardMetadata | undefined>(
    {
      queryKey: [BOARD_METADATA_KEY, { boardId }],
      exact: false,
    },
    (data) => {
      if (!data) {
        return undefined;
      }
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
  queryClient.setQueriesData<Record<string, PinnedBoardType>>(
    {
      queryKey: PINNED_BOARDS_QUERY_KEY,
    },
    (data) => {
      const pinnedBoard = data?.[boardId];
      if (!pinnedBoard) {
        return data || {};
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
  queryClient.setQueryData<Record<string, PinnedBoardType>>(
    PINNED_BOARDS_QUERY_KEY,
    (data) => {
      const currentBoardData = data?.[board.id];
      if (currentBoardData) {
        return data;
      }
      const currentMaxIndex = Math.max(
        ...Object.values(data || {}).map((board) => board.pinnedIndex),
        0
      );
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
  queryClient.setQueriesData<Record<string, PinnedBoardType>>(
    {
      queryKey: PINNED_BOARDS_QUERY_KEY,
    },
    (data) => {
      if (!data?.[boardId]) {
        return data || {};
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
    boardId,
    mute,
  }: {
    boardId: string;
    mute: boolean;
  }
) => {
  setBoardMetadataInCache(queryClient, { boardId }, (boardMetadata) => {
    return { ...boardMetadata, muted: mute };
  });
  setPinnedBoardInCache(queryClient, { boardId }, (board) => {
    return { ...board, muted: mute };
  });
  setBoardSummaryInCache(queryClient, { boardId }, (board) => {
    return { ...board, muted: mute };
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
    return { ...boardMetadata, pinned: pin };
  });
  if (pin) {
    const boardSummary = getBoardSummaryInCache(queryClient, { boardId });
    if (boardSummary) {
      addPinnedBoardInCache(queryClient, {
        board: { ...boardSummary },
      });
    }
  } else {
    removePinnedBoardInCache(queryClient, { boardId });
  }
  setBoardSummaryInCache(queryClient, { boardId }, (board) => {
    return { ...board, pinned: pin };
  });
};
