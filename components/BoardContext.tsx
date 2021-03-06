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
//const STALE_TIME = 1000 * 30; // Make stale after 30s
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
    postingIdentities:
      newBoardData.postingIdentities || oldBoardData?.postingIdentities || [],
    suggestedCategories: descriptions.flatMap(
      (description) => description.categories || []
    ),
  };
};

const toBoardsDataObject = (boardsArray: BoardData[]) => {
  return boardsArray.reduce<BoardsDataMap>((agg, value) => {
    agg[value.slug] = updateBoardData(value, null);
    return agg;
  }, {});
};

const getNextPinnedOrder = (boardData: BoardsDataMap) => {
  const pinnedOrders = Object.values(boardData).map(
    (boardData) => boardData.pinnedOrder || 0
  );
  return Math.max(...pinnedOrders, 0) + 1;
};

const BoardContextProvider: React.FC<{
  initialData: BoardData[];
  slug: string | null;
  children?: React.ReactNode;
}> = (props) => {
  log(`Rerendering board context for slug ${props.slug}`);
  const { isLoggedIn } = useAuth();
  const { slug } = props;
  // We store this data in a ref so that we can keep a reference for subsequent re-renders,
  // as the result of the "allBoardsData" and "boardData" query need to be merged with previous
  // data to create the final value returned by this provider.
  // We could also do this with setState, but it creates unnecessary re-renders: when data from
  // these two queries is different from the previously returned one, the tracked "data" property
  // will signal an update, and this component will then re-render automatically.
  // Note that these refs are updated at appropriate times during the `select` method in useQuery,
  // ensuring that, when this provider re-renders, these refs always contain the latest data.
  const currentBoardsData = React.useRef<BoardsDataMap>({});
  const isLoggedInData = React.useRef<boolean>(false);

  // This handler takes care of transforming the board result returned from a query
  // to the /boards endpoint (i.e. the one returning details for ALL boards).
  // Note that, at least for now, this handler returns ALL the board, so boards that were there but
  // aren't anymore can be safely removed.
  const { refetch: refetchAllBoards } = useQuery<
    BoardData[] | undefined,
    unknown,
    BoardsDataMap
  >(
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
      // @ts-expect-error
      initialData: props.initialData,
      staleTime: 1000 * 5,
      refetchInterval: REFETCH_TIME,
      refetchOnWindowFocus: true,
      notifyOnChangeProps: ["data"],
      isDataEqual: (oldD, newD) => {
        info("Checking if all boards data has changed...");
        const changed = JSON.stringify(oldD) !== JSON.stringify(newD);
        info(`...it has${changed ? "" : "n't"}.`);
        return !changed;
      },
      keepPreviousData: true,
      select: (allBoardsData) => {
        log("Received new data for all boards");
        info("New boards data: ", allBoardsData);
        if (!allBoardsData) {
          return currentBoardsData.current;
        }
        const newBoardsData = toBoardsDataObject(allBoardsData);
        // Add data from delisted boards to our results, so it won't be removed
        // when merging data.
        // NOTE: a delisted board can be in the "allBoardsData" result if it's been pinned.
        Object.values(currentBoardsData).forEach((data) => {
          if (data.delisted && !newBoardsData[data.slug]) {
            newBoardsData[data.slug] = data;
          }
        });
        currentBoardsData.current = newBoardsData;
        isLoggedInData.current = isLoggedIn;
        return newBoardsData;
      },
    }
  );

  // This handler takes care of transforming the board result returned from a query
  // to the /boards/:slug endpoint (i.e. the one returning details for the "slug" board).
  useQuery<BoardData | undefined, unknown, BoardsDataMap>(
    ["boardThemeData", { slug, isLoggedIn }],
    () => {
      info(
        `Fetching theme data for slug "${slug}" and user ${
          isLoggedIn ? "" : "NOT "
        }logged in.`
      );
      if (!slug) {
        return Promise.resolve(undefined);
      }
      return getBoardData({ slug });
    },
    {
      staleTime: Infinity,
      notifyOnChangeProps: ["data"],
      keepPreviousData: true,
      select: (boardData) => {
        log(`Received new data for board ${slug}`);
        if (!boardData) {
          return currentBoardsData.current;
        }
        const updatedBoardsData = {
          ...currentBoardsData.current,
        };
        updatedBoardsData[boardData.slug] = updateBoardData(
          boardData,
          currentBoardsData.current[boardData.slug]
        );
        currentBoardsData.current = updatedBoardsData;
        return updatedBoardsData;
      },
    }
  );

  const nextPinnedOrder = getNextPinnedOrder(currentBoardsData.current);

  return (
    <BoardsContext.Provider
      value={{
        boardsData: currentBoardsData.current,
        nextPinnedOrder,
        refetch: refetchAllBoards,
        hasLoggedInData: isLoggedInData.current,
      }}
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
