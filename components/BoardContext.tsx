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
  log(`Rerendering board context for slug ${props.slug}`);
  const { isLoggedIn } = useAuth();
  const { slug } = props;
  // The data received from the "allBoards" and "presentBoard" queries is merged into a single
  // state here. Unnecessary re-renders are avoided by using `notifyOnChangeProps: []` on the
  // useQuery hook, disabling automatic re-renders in case of new query data.
  // TODO: it'd be better to just have different contexts with smaller snapshots of this data.
  // This is because a lot of data (especially the "updates" one) that is returned by these queries
  // is of no interest at all to most components.
  // By having more specialized providers, data could be transformed directly in the `select`
  // method making it easier to diff what is actually necessary for rendering.
  const [currentBoardsData, setBoardsData] = React.useState({
    loggedIn: isLoggedIn,
    boardsData: toBoardsDataObject(props.initialData),
  });

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
      // We never notify because we let the state update on result deal with this.
      notifyOnChangeProps: [],
      isDataEqual: (oldD, newD) => {
        info("Checking if all boards data has changed...");
        const changed = !isSameBoardsData(newD, oldD);
        info(`...it has${changed ? "" : "n't"}.`);
        return !changed;
      },
      keepPreviousData: true,
      select: (allBoardsData) => {
        log("Received new data for all boards");
        info("New boards data: ", allBoardsData);
        if (!allBoardsData) {
          return currentBoardsData.boardsData;
        }
        const newBoardsData = toBoardsDataObject(allBoardsData);
        // Add data from delisted boards to our results, so it won't be removed
        // when merging data.
        // NOTE: a delisted board can be in the "allBoardsData" result if it's been pinned.
        Object.values(currentBoardsData.boardsData).forEach((data) => {
          if (data.delisted && !newBoardsData[data.slug]) {
            newBoardsData[data.slug] = data;
          }
        });
        return newBoardsData;
      },
      onSuccess: (data) => {
        if (
          !isSameBoardsData(data, currentBoardsData.boardsData) ||
          isLoggedIn != currentBoardsData.loggedIn
        ) {
          log(`Updating boards data.`);
          setBoardsData({
            loggedIn: isLoggedIn,
            boardsData: data,
          });
        }
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
      notifyOnChangeProps: [],
      keepPreviousData: true,
      isDataEqual: (oldD, newD) => {
        info(`Checking if boards data for ${slug} changed...`);
        const changed = !isSameBoardsData(newD, oldD);
        info(`...it has${changed ? "" : "n't"}.`);
        return !changed;
      },
      select: (boardData) => {
        log(`Received new data for board ${slug}`);
        if (!boardData) {
          return currentBoardsData.boardsData;
        }
        const updatedBoardsData = {
          ...currentBoardsData.boardsData,
        };
        updatedBoardsData[boardData.slug] = updateBoardData(
          boardData,
          currentBoardsData[boardData.slug]
        );
        return updatedBoardsData;
      },
      onSuccess: (data) => {
        if (
          !isSameBoardsData(data, currentBoardsData.boardsData) ||
          isLoggedIn != currentBoardsData.loggedIn
        ) {
          log(`Updating boards data with data from ${slug}.`);
          setBoardsData({
            loggedIn: isLoggedIn,
            boardsData: data,
          });
        }
      },
    }
  );

  const nextPinnedOrder = getNextPinnedOrder(currentBoardsData.boardsData);

  log(`Returning new data logged in: ${isLoggedIn}`);
  return (
    <BoardsContext.Provider
      value={React.useMemo(
        () => ({
          boardsData: currentBoardsData.boardsData,
          nextPinnedOrder,
          refetch: refetchAllBoards,
          hasLoggedInData: currentBoardsData.loggedIn,
        }),
        [currentBoardsData, refetchAllBoards, nextPinnedOrder]
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
