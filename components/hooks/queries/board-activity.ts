import { useInfiniteQuery } from "react-query";
import { getBoardActivityData } from "../../../utils/queries";
import { useBoardSummaryBySlug } from "./board";
import { useAuth } from "../../Auth";

const BOARD_ACTIVITY_KEY = "boardActivityData";
export function useBoardActivity(props: {
  slug: string | null;
  // TODO: figure out better typing from query params
  categoryFilter: (string | null)[] | null | undefined;
}) {
  const { slug, categoryFilter } = props;
  const boardSummary = useBoardSummaryBySlug(slug);
  const { isLoggedIn, isPending: isAuthPending } = useAuth();

  return useInfiniteQuery(
    [BOARD_ACTIVITY_KEY, { slug, categoryFilter }],
    ({ pageParam = undefined }) =>
      getBoardActivityData(
        { slug, categoryFilter: categoryFilter?.[0] || null },
        pageParam
      ),
    {
      getNextPageParam: (lastGroup) => {
        return lastGroup?.nextPageCursor;
      },
      // Block this query for loggedInOnly boards (unless we're logged in)
      enabled:
        (slug && boardSummary && !boardSummary.loggedInOnly) ||
        (!isAuthPending && isLoggedIn),
      refetchOnWindowFocus: false,
    }
  );
}
