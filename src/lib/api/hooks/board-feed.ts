import { useInfiniteQuery, useQueryClient } from "react-query";

import React from "react";
import { getBoardActivityData } from "lib/api/queries/feeds";
import { useAuth } from "components/Auth";
import { useBoardSummary } from "contexts/RealmContext";

export const BOARD_ACTIVITY_KEY = "boardActivityData";
export function useBoardActivity(props: {
  boardId: string | null;
  // TODO: figure out better typing from query params
  categoryFilter: (string | null)[] | null | undefined;
}) {
  const { boardId, categoryFilter } = props;
  const boardSummary = useBoardSummary({ boardId });
  const { isLoggedIn, isPending: isAuthPending } = useAuth();

  return useInfiniteQuery(
    [BOARD_ACTIVITY_KEY, { boardId, categoryFilter }],
    ({ pageParam = undefined }) =>
      getBoardActivityData(
        { boardId: boardId!, categoryFilter: categoryFilter?.[0] ?? undefined },
        pageParam
      ),
    {
      getNextPageParam: (lastGroup) => {
        return lastGroup?.cursor.next;
      },
      // Block this query for loggedInOnly boards (unless we're logged in)
      enabled:
        (boardId && boardSummary && !boardSummary.loggedInOnly) ||
        (!!boardId && !isAuthPending && isLoggedIn),
      refetchOnWindowFocus: false,
    }
  );
}

export const useRefetchBoardActivity = () => {
  const queryClient = useQueryClient();
  return React.useCallback(
    ({ boardId }: { boardId: string | null }) =>
      queryClient.invalidateQueries([BOARD_ACTIVITY_KEY, { boardId }]),
    [queryClient]
  );
};
