import { useQuery, useQueryClient } from "react-query";

import { BoardSummary } from "types/Types";
import axios from "axios";
import { makeClientBoardSummary } from "utils/client-data";
import { useAuth } from "components/Auth";

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
