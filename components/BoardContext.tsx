import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { getBoardData, getAllBoardsData } from "../utils/queries/board";
import { BoardData } from "../types/Types";
import noop from "noop-ts";
import { useAuth } from "./Auth";

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

const updateBoardData = (
  newBoardData: BoardData,
  oldBoardData: BoardData | null
): BoardData => {
  const descriptions =
    newBoardData.descriptions.length > 0
      ? newBoardData.descriptions
      : oldBoardData?.descriptions || [];

  return {
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
    loggedInOnly: newBoardData.loggedInOnly,
    delisted: newBoardData.delisted,
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
};

const getNextPinnedOrder = (boardData: BoardData[]) =>
  Math.max(...boardData.map((boardData) => boardData.pinnedOrder || 0), 0) + 1;

const BoardContextProvider: React.FC<{
  initialData?: BoardData[];
}> = (props) => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const slug = router.query.boardId?.slice(1) as string;
  const [boardsData, setBoardsData] = React.useState<
    BoardContextType["boardsData"]
  >(
    props.initialData?.reduce((agg, value: any) => {
      agg[value.slug] = updateBoardData(value, null);
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
  const { data: allBoardsData, refetch: refetchAllBoards } = useQuery(
    "allBoardsData",
    getAllBoardsData,
    {
      initialData: () => Object.values(boardsData),
      initialStale: true,
      staleTime: 1000 * 30, // Make stale after 30s
      refetchInterval: 1000 * 60 * 1, // Refetch automatically every minute
      refetchOnWindowFocus: true,
    }
  );
  React.useEffect(() => {
    if (!allBoardsData) {
      return;
    }
    const newBoardsData: BoardContextType["boardsData"] = allBoardsData.reduce(
      (agg, value) => {
        agg[value.slug] = updateBoardData(value, boardsData[value.slug]);
        return agg;
      },
      {} as BoardContextType["boardsData"]
    );
    // Readd all data from delisted boards
    // NOTE: a delisted board can be in the "allBoardsData" result if it's been pinned.
    Object.values(boardsData).forEach((data) => {
      if (data.delisted && !newBoardsData[data.slug]) {
        // We haven't found this data in the "all boards data", so we can't update it here.
        newBoardsData[data.slug] = data;
      }
    });
    setBoardsData(newBoardsData);
    setNextPinnedOrder(getNextPinnedOrder(Object.values(newBoardsData)));
  }, [allBoardsData]);

  React.useEffect(() => {
    if (isLoggedIn) {
      refetchAllBoards();
    }
  }, [isLoggedIn]);

  // This handler takes care of transforming the board result returned from a query
  // to the /boards/:slug endpoint (i.e. the one returning details for the "slug" board).
  const { data: boardData, refetch: refetchCurrentBoard } = useQuery(
    ["boardThemeData", { slug }],
    getBoardData,
    { staleTime: Infinity }
  );
  React.useEffect(() => {
    if (boardData) {
      const updatedBoardsData = {
        ...boardsData,
      };
      // Update the value of the board whose value we just requested.
      updatedBoardsData[boardData.slug] = updateBoardData(
        boardData,
        boardsData[boardData.slug]
      );
      setBoardsData(updatedBoardsData);
      setNextPinnedOrder(getNextPinnedOrder(Object.values(updatedBoardsData)));
    }
  }, [boardData]);

  React.useEffect(() => {
    if (isLoggedIn) {
      refetchCurrentBoard();
    }
  }, [isLoggedIn]);

  return (
    <BoardContext.Provider
      value={{
        boardsData,
        nextPinnedOrder,
        refetch: refetchAllBoards,
      }}
      {
        ...props /* this is here for props.children */
      }
    />
  );
};

export { BoardContextProvider, useBoardContext };
