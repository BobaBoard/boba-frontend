import React from "react";
import { useQuery } from "react-query";
import { getBoardData, getAllBoardsData } from "../utils/queries/board";
import { BoardData } from "../types/Types";
import noop from "noop-ts";
import { useAuth } from "./Auth";

import debug from "debug";
const log = debug("bobafrontend:BoardContext-log");
const info = debug("bobafrontend:BoardContext-info");

type BoardsDataMap = { [key: string]: BoardData };
interface BoardsContextType {
  boardsData: BoardsDataMap;
  nextPinnedOrder: number;
  hasLoggedInData: boolean;
  refetch: () => void;
}

const BoardsContext = React.createContext<BoardsContextType>({
  boardsData: {},
  nextPinnedOrder: 1,
  hasLoggedInData: false,
  refetch: noop,
});

const useBoardsContext = () =>
  React.useContext<BoardsContextType>(BoardsContext);

const useBoardContext = (slug: string): BoardData | undefined => {
  const context = React.useContext<BoardsContextType>(BoardsContext);

  return context.boardsData[slug];
};

const REFETCH_TIME = 1000 * 60 * 1; // Refetch automatically every minute
const STALE_TIME = 1000 * 30; // Make stale after 30s
const updateBoardData = (
  newBoardData: BoardData,
  oldBoardData: BoardData | null | undefined
): BoardData => {
  const descriptions =
    newBoardData.descriptions?.length > 0
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
    lastUpdateFromOthers:
      typeof newBoardData.lastUpdateFromOthers !== "undefined"
        ? newBoardData.lastUpdateFromOthers
        : oldBoardData?.lastUpdateFromOthers,
    lastVisit:
      typeof newBoardData.lastVisit !== "undefined"
        ? newBoardData.lastVisit
        : oldBoardData?.lastVisit,
    pinnedOrder: newBoardData.pinnedOrder,
    permissions: newBoardData.permissions || oldBoardData?.permissions,
    accessories: newBoardData.accessories || oldBoardData?.accessories,
    postingIdentities:
      newBoardData.postingIdentities || oldBoardData?.postingIdentities || [],
    suggestedCategories: descriptions.flatMap(
      (description) => description.categories || []
    ),
  };
};

const mergeBoardsDataMaps = (
  currentData: BoardsDataMap,
  newData: BoardsDataMap | null | undefined
) => {
  if (!newData) {
    return { ...currentData };
  }
  const result = { ...newData };
  Object.entries(newData).forEach(([slug, data]) => {
    result[slug] = updateBoardData(data, currentData[slug]);
  });
  // If there's data that was in the old data but it's not in the new we keep it.
  // At some point, when boards can be deleted or added, we'll need to revisit this.
  // TODO: revisit this.
  Object.entries(currentData).forEach(([slug, data]) => {
    if (!result[slug]) {
      result[slug] = { ...data };
    }
  });
  return result;
};

const mergeBoardsData = (
  currentData: BoardsDataMap,
  toMerge: (BoardsDataMap | null | undefined)[]
) => {
  if (!toMerge.length) {
    return currentData;
  }
  let result = currentData;
  toMerge.forEach((merge) => {
    result = mergeBoardsDataMaps(result, merge);
  });
  return result;
};

const toBoardsDataObject = (boardsArray: BoardData[]) => {
  return boardsArray.reduce<BoardsDataMap>((agg, value) => {
    agg[value.slug] = value;
    return agg;
  }, {});
};

const getNextPinnedOrder = (boardData: BoardsDataMap) => {
  const pinnedOrders = Object.values(boardData).map(
    (boardData) => boardData.pinnedOrder || 0
  );
  return Math.max(...pinnedOrders, 0) + 1;
};

const isSameBoardsData = (
  newData: BoardsDataMap | undefined,
  oldData: BoardsDataMap | undefined
) => {
  // TODO: if this stays, find better diffing mechanism.
  return JSON.stringify(newData) === JSON.stringify(oldData);
};

const BoardContextProvider: React.FC<{
  initialData: BoardData[];
  slug: string | null;
  children?: React.ReactNode;
}> = (props) => {
  log(`Re-rendering board context for slug ${props.slug}...`);
  info(`Initial data:`, props.initialData);
  const { isLoggedIn } = useAuth();
  const { slug } = props;
  const latestBoardData = React.useRef<BoardsDataMap>(
    toBoardsDataObject(props.initialData)
  );

  // This handler takes care of transforming the board result returned from a query
  // to the /boards endpoint (i.e. the one returning details for ALL boards).
  // Note that, at least for now, this handler returns ALL the board, so boards that were there but
  // aren't anymore can be safely removed.
  const {
    refetch: refetchAllBoards,
    data: allBoardsData,
    dataUpdatedAt: lastAllBoardsUpdate,
  } = useQuery<BoardData[], unknown, BoardsDataMap>(
    ["allBoardsData", { isLoggedIn }],
    () => {
      info(
        `Fetching all boards data for user ${
          isLoggedIn ? "" : "NOT "
        }logged in.`
      );
      return getAllBoardsData();
    },
    {
      placeholderData: toBoardsDataObject(props.initialData),
      staleTime: STALE_TIME,
      refetchInterval: REFETCH_TIME,
      refetchOnWindowFocus: true,
      // We never notify because we let the state update on result deal with this.
      notifyOnChangeProps: ["data"],
      isDataEqual: (oldD, newD) => {
        info("Checking if all boards data has changed...");
        const equal = isSameBoardsData(newD, oldD);
        info(`...it has${equal ? "n't" : ""}.`);
        return equal;
      },
      select: (data) => toBoardsDataObject(data),
    }
  );

  // This handler takes care of transforming the board result returned from a query
  // to the /boards/:slug endpoint (i.e. the one returning details for the "slug" board).
  const {
    data: currentBoardData,
    dataUpdatedAt: lastCurrentBoardUpdate,
  } = useQuery<BoardData | null, unknown, BoardsDataMap | null>(
    ["boardThemeData", { slug, isLoggedIn }],
    () => {
      info(
        `Fetching theme data for slug "${slug}" and user ${
          isLoggedIn ? "" : "NOT "
        }logged in.`
      );
      return getBoardData({ slug });
    },
    {
      staleTime: Infinity,
      notifyOnChangeProps: ["data"],
      enabled: !!slug,
      select: (data) => (data ? toBoardsDataObject([data]) : null),
    }
  );

  const newData = mergeBoardsData(
    latestBoardData.current,
    // Update in order of data "freshness"
    lastAllBoardsUpdate > lastCurrentBoardUpdate
      ? [currentBoardData, allBoardsData]
      : [allBoardsData, currentBoardData]
  );
  // Keep referential integrity for currentData to avoid unnecessary re-renders.
  const currentData = isSameBoardsData(latestBoardData.current, newData)
    ? latestBoardData.current
    : newData;
  info(`Returning data`, currentData);
  log(`...Found ${newData === currentData ? "" : "NO "}updated data!`);
  latestBoardData.current = currentData;
  return (
    <BoardsContext.Provider
      value={React.useMemo(
        () => ({
          boardsData: currentData,
          nextPinnedOrder: getNextPinnedOrder(currentData),
          refetch: refetchAllBoards,
          hasLoggedInData: isLoggedIn,
        }),
        [currentData, refetchAllBoards, isLoggedIn]
      )}
    >
      {props.children}
    </BoardsContext.Provider>
  );
};

const MemoizedProvider = React.memo(BoardContextProvider);
export {
  MemoizedProvider as BoardContextProvider,
  useBoardsContext,
  useBoardContext,
};
