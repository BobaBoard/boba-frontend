import { useQuery } from "react-query";
import debug from "debug";
import { BoardSummary } from "../../../types/Types";
import axios from "axios";
import { useAuth } from "../../Auth";
import { makeClientBoardSummary } from "utils/server-utils";

const error = debug("bobafrontend:hooks:queries:PinnedBoards-error");
const log = debug("bobafrontend:hooks:queries:PinnedBoards-log");

interface PinnedBoardType extends BoardSummary {
  pinnedIndex: number;
}

export const usePinnedBoards = () => {
  const { isLoggedIn } = useAuth();
  const { data, isFetching, isFetched } = useQuery<
    { [key: string]: any },
    undefined,
    Record<string, PinnedBoardType>
  >(
    "pinnedBoardsKey",
    async () => {
      const data = await axios.get("/users/@me");

      return data.data.pinned_boards as { [key: string]: any };
    },
    {
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      enabled: isLoggedIn,
      select: (data) => {
        return Object.values(data).reduce<Record<string, PinnedBoardType>>(
          (agg, curr) => {
            agg[curr.id] = {
              ...makeClientBoardSummary(curr),
              pinnedIndex: curr.index,
            };
            return agg;
          },
          {}
        );
      },
    }
  );

  return { data, isFetching, isFetched };
};
