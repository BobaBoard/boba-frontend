import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { getBoardData, getAllBoardsData } from "../utils/queries/board";
import { BoardData } from "../types/Types";
import noop from "noop-ts";

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
  return {
    ...oldBoardData,
    slug: newBoardData.slug,
    avatarUrl: newBoardData.avatarUrl,
    tagline: newBoardData.tagline,
    accentColor: newBoardData.accentColor,
    descriptions: newBoardData.descriptions,
    muted: newBoardData.muted,
    pinnedOrder: newBoardData.pinnedOrder,
    permissions:
      newBoardData.permissions || oldBoardData?.permissions || ([] as any),
    postingIdentities:
      newBoardData.postingIdentities || oldBoardData?.postingIdentities || [],
    suggestedCategories: (
      newBoardData.descriptions ||
      oldBoardData?.descriptions ||
      []
    )?.flatMap((description) => description.categories || []),
  };
};

const getNextPinnedOrder = (boardData: BoardData[]) =>
  Math.max(...boardData.map((boardData) => boardData.pinnedOrder || 0), 0) + 1;

const BoardContextProvider: React.FC<{
  initialData?: BoardData[];
}> = (props) => {
  const router = useRouter();
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
  const { data: allBoardsData, refetch } = useQuery(
    "allBoardsData",
    getAllBoardsData,
    {
      initialData: () => Object.values(boardsData),
      initialStale: false,
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
    const updatedBoardsData = {
      ...boardsData,
      ...newBoardsData,
    };
    setBoardsData(updatedBoardsData);
    setNextPinnedOrder(getNextPinnedOrder(Object.values(updatedBoardsData)));
  }, [allBoardsData]);

  // This handler takes care of transforming the board result returned from a query
  // to the /boards/:slug endpoint (i.e. the one returning details for the "slug" board).
  const { data: boardData } = useQuery(
    ["boardThemeData", { slug: router.query.boardId?.slice(1) }],
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

  return (
    <BoardContext.Provider
      value={{ boardsData, nextPinnedOrder, refetch }}
      {
        ...props /* this is here for props.children */
      }
    />
  );
};

export { BoardContextProvider, useBoardContext };
