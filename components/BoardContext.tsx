import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { getBoardData, getAllBoardsData } from "../utils/queries/board";
import { BoardData } from "../types/Types";
import noop from "noop-ts";
import { useAuth } from "./Auth";

const deepEqual = require("fast-deep-equal");

import debug from "debug";

const log = debug("bobafrontend:BoardContext-log");

interface BoardContextType {
  boardsData: { [key: string]: BoardData };
  nextPinnedOrder: number;
  refetch: () => void;
}

const BoardContext = React.createContext<BoardContextType>({
  boardsData: {},
  nextPinnedOrder: 1,
  refetch: noop,
});

const useBoardContext = () => React.useContext<BoardContextType>(BoardContext);

const maybeGetUpdatedBoardData = (
  newBoardData: BoardData,
  oldBoardData: BoardData | null
): BoardData => {
  const descriptions =
    newBoardData.descriptions.length > 0
      ? newBoardData.descriptions
      : oldBoardData?.descriptions || [];
  const newValue = {
    ...oldBoardData,
    slug: newBoardData.slug,
    avatarUrl: newBoardData.avatarUrl,
    tagline: newBoardData.tagline,
    accentColor: newBoardData.accentColor,
    descriptions,
    muted: newBoardData.muted,
    hasUpdates: !!(typeof newBoardData.hasUpdates !== "undefined"
      ? newBoardData.hasUpdates
      : oldBoardData?.hasUpdates),
    lastUpdate:
      typeof newBoardData.lastUpdate !== "undefined"
        ? newBoardData.lastUpdate
        : oldBoardData?.lastUpdate,
    pinnedOrder: newBoardData.pinnedOrder,
    permissions:
      newBoardData.permissions || oldBoardData?.permissions || ([] as any),
    postingIdentities:
      newBoardData.postingIdentities || oldBoardData?.postingIdentities || [],
    suggestedCategories: descriptions.flatMap(
      (description) => description.categories || []
    ),
  };

  return oldBoardData && deepEqual(newValue, oldBoardData)
    ? oldBoardData
    : newValue;
};

const getNextPinnedOrder = (boardData: BoardData[]) =>
  Math.max(...boardData.map((boardData) => boardData.pinnedOrder || 0), 0) + 1;

const BoardContextProvider: React.FC<{
  initialData?: BoardData[];
}> = (props) => {
  const router = useRouter();
  const slug = router.query.boardId?.slice(1) as string;
  const { isLoggedIn } = useAuth();
  const [boardsData, setBoardsData] = React.useState<
    BoardContextType["boardsData"]
  >(
    () =>
      props.initialData?.reduce((agg, value: any) => {
        log("!!!!!!!!!Initializing boards data");
        agg[value.slug] = maybeGetUpdatedBoardData(value, null);
        return agg;
      }, {} as BoardContextType["boardsData"]) || {}
  );
  const [nextPinnedOrder, setNextPinnedOrder] = React.useState(
    getNextPinnedOrder(props.initialData || [])
  );

  // This handler takes care of transforming the board result returned from a query
  // to the /boards endpoint (i.e. the one returning details for ALL boards).
  // Note that, at least for now, this handler returns ALL the board, so boards that were there but
  // aren't anymore can be safely removed.
  const { refetch: refetchAllBoards } = useQuery(
    "allBoardsData",
    getAllBoardsData,
    {
      initialData: () => Object.values(boardsData),
      initialStale: true,
      staleTime: 1000 * 30, // Make stale after 30s
      refetchInterval: 1000 * 60 * 1, // Refetch automatically every minute
      refetchOnWindowFocus: true,
      onSuccess: (data) => {
        log("Fetched new data for boards");
        if (!data) {
          return;
        }
        const newBoardsData: BoardContextType["boardsData"] = data.reduce(
          (agg, value) => {
            agg[value.slug] = maybeGetUpdatedBoardData(
              value,
              boardsData[value.slug]
            );
            return agg;
          },
          {} as BoardContextType["boardsData"]
        );
        const updated = Object.keys(newBoardsData).some(
          (slug) => newBoardsData[slug] != boardsData[slug]
        );
        if (!updated) {
          log(
            "Fetched new value for all boards data, but no update was found."
          );
          return;
        }
        log("Found updated values in new boards data.");
        setBoardsData(newBoardsData);
        setNextPinnedOrder(getNextPinnedOrder(Object.values(newBoardsData)));
      },
    }
  );

  React.useEffect(() => {
    log(`Logged in changed ${slug} \ ${isLoggedIn}`);
    if (isLoggedIn) {
      refetchAllBoards();
    }
  }, [isLoggedIn]);

  // This handler takes care of transforming the board result returned from a query
  // to the /boards/:slug endpoint (i.e. the one returning details for the "slug" board).
  const { refetch: refetchCurrentBoard } = useQuery(
    ["boardThemeData", { slug }],
    getBoardData,
    {
      staleTime: Infinity,
      onSuccess: (data) => {
        if (data) {
          log(`Fetched new data for board ${slug}`);
          // Update the value of the board whose value we just requested.
          const newBoardData = maybeGetUpdatedBoardData(
            data,
            boardsData[data.slug]
          );
          const updated = newBoardData != boardsData[data.slug];
          if (!updated) {
            log(
              `Fetched new value for board ${slug}, but no update was found.`
            );
            return;
          }
          const updatedBoardsData = {
            ...boardsData,
            [data.slug]: newBoardData,
          };
          log(`Found updated values for board with slug ${slug}.`);
          setBoardsData(updatedBoardsData);
          setNextPinnedOrder(
            getNextPinnedOrder(Object.values(updatedBoardsData))
          );
        }
      },
    }
  );
  React.useEffect(() => {
    log(`Slug or logged in changed ${slug} \ ${isLoggedIn}`);
    if (isLoggedIn) {
      refetchCurrentBoard();
    }
  }, [isLoggedIn, slug]);

  log("Re-rendering context");
  return (
    <BoardContext.Provider
      value={React.useMemo(() => {
        log("Getting new value for provider");
        return {
          boardsData,
          nextPinnedOrder,
          refetch: refetchAllBoards,
        };
      }, [boardsData, nextPinnedOrder, refetchAllBoards])}
    >
      {props.children}
    </BoardContext.Provider>
  );
};

export { BoardContextProvider, useBoardContext };
