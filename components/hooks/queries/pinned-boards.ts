import { QueryClient, useQuery, useQueryClient } from "react-query";
import { BoardSummary } from "../../../types/Types";
import axios from "axios";
import { useAuth } from "../../Auth";
import { makeClientBoardSummary } from "utils/server-utils";
import {
  getBoardSummaryInCache,
  updateBoardMetadataInCache,
  updateBoardSummaryInCache,
} from "utils/queries/cache";

// import debug from "debug";
// const error = debug("bobafrontend:hooks:queries:PinnedBoards-error");
// const log = debug("bobafrontend:hooks:queries:PinnedBoards-log");

export interface PinnedBoardType extends BoardSummary {
  pinnedIndex: number;
}

export const PINNED_BOARDS_QUERY_KEY = "pinnedBoardsKey";
export const usePinnedBoards = () => {
  const { isLoggedIn } = useAuth();
  const { data, isFetching, isFetched } = useQuery<
    Record<string, PinnedBoardType>
  >(
    PINNED_BOARDS_QUERY_KEY,
    async () => {
      const data = await axios.get("/users/@me");

      const pinnedBoards = data.data.pinned_boards;
      return Object.values(pinnedBoards).reduce<
        Record<string, PinnedBoardType>
      >((agg, curr: any) => {
        agg[curr.id] = {
          ...makeClientBoardSummary(curr),
          pinnedIndex: curr.index,
        };
        return agg;
      }, {});
    },
    {
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      enabled: isLoggedIn,
    }
  );

  return { data, isFetching, isFetched };
};

export const useRefetchPinnedBoards = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries(PINNED_BOARDS_QUERY_KEY);
};

export const useBoardPinnedIndex = (boardId: string | null) => {
  const { data: boardsData, isFetched } = usePinnedBoards();

  if (!isFetched || !boardsData || !boardId) {
    return null;
  }

  return boardsData[boardId].pinnedIndex;
};

export const maybeSetBoardPinnedInCache = (
  queryClient: QueryClient,
  { boardId, pin }: { boardId: string; pin: boolean }
) => {
  // TODO: use "setQueriesData" for this method
  const cachedData = queryClient.getQueryData<Record<string, PinnedBoardType>>(
    PINNED_BOARDS_QUERY_KEY
  );
  if (!cachedData) {
    return;
  }
  const newCachedData = {
    ...cachedData,
  };
  if (pin) {
    const currentMaxIndex = Math.max(
      ...Object.values(cachedData).map((board) => board.pinnedIndex)
    );
    const boardSummary = getBoardSummaryInCache(queryClient, { boardId });
    if (!boardSummary) {
      return;
    }
    newCachedData[boardId] = {
      ...boardSummary,
      pinnedIndex: currentMaxIndex + 1,
    };
  } else {
    delete newCachedData[boardId];
  }
  updateBoardMetadataInCache(queryClient, { boardId }, (boardMetadata) => {
    boardMetadata.pinned = pin;
    return boardMetadata;
  });
  updateBoardSummaryInCache(queryClient, { boardId }, (board) => {
    board.pinned = pin;
    return board;
  });
  queryClient.setQueryData(PINNED_BOARDS_QUERY_KEY, newCachedData);
};
