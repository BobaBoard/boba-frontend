import React from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryCache } from "react-query";
import { getBoardData, getAllBoardsData } from "../../utils/queries/board";
import { BoardData } from "../../types/Types";
import { useAuth } from "../Auth";

const deepEqual = require("fast-deep-equal");

import debug from "debug";
const log = debug("bobafrontend:useBoardsData-log");

const mergeBoardData = (
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

interface BoardsData {
  [key: string]: BoardData;
}

const getNextPinnedOrder = (boardsData: BoardsData | undefined) => {
  if (!boardsData) {
    return 1;
  }
  return (
    Math.max(
      ...Object.values(boardsData).map(
        ({ slug }) => boardsData[slug]?.pinnedOrder || 0
      ),
      0
    ) + 1
  );
};

export default () => {
  const router = useRouter();
  const slug = router.query.boardId?.slice(1) as string;
  const { isLoggedIn } = useAuth();
  const queryCache = useQueryCache();

  // This handler takes care of transforming the board result returned from a query
  // to the /boards endpoint (i.e. the one returning details for ALL boards).
  // Note that, at least for now, this handler returns ALL the board, so boards that were there but
  // aren't anymore can be safely removed.
  const {
    data: allBoardsData,
    refetch: refetchAllBoards,
    isFetching: isFetchingAllBoardsData,
  } = useQuery<BoardsData>(
    "allBoardsData",
    async (key) => {
      const boardData = await getAllBoardsData(key);
      const cachedData =
        queryCache.getQueryData<BoardsData | undefined>("allBoardsData") || {};
      const newBoardsData: BoardsData = boardData!.reduce((agg, value) => {
        agg[value.slug] = mergeBoardData(value, cachedData[value.slug]);
        return agg;
      }, {} as BoardsData);
      log(newBoardsData);

      return newBoardsData;
    },
    {
      initialStale: true,
      staleTime: 1000 * 30, // Make stale after 30s
      refetchInterval: 1000 * 60 * 1, // Refetch automatically every minute
      refetchOnWindowFocus: true,
      isDataEqual: (oldData: BoardsData, newData: BoardsData) => {
        const updated = !deepEqual(newData, oldData);
        log(
          `Received new data for all boards query. Found: ${
            updated ? "updated" : "NOT updated"
          }`
        );
        return !updated;
      },
      onSuccess: (data) => {
        log("Fetched new data for boards");
        if (!slug || !data?.[slug]) {
          return;
        }
        const currentBoardData = queryCache.getQueryData([
          "boardThemeData",
          { slug },
        ]);
        if (!currentBoardData) {
          queryCache.setQueryData(["boardThemeData", { slug }], data[slug]);
        }
      },
    }
  );

  React.useEffect(() => {
    log(`Logged in changed ${slug} \ ${isLoggedIn}`);
    if (isLoggedIn && !isFetchingAllBoardsData) {
      refetchAllBoards();
    }
  }, [isLoggedIn]);

  // This handler takes care of transforming the board result returned from a query
  // to the /boards/:slug endpoint (i.e. the one returning details for the "slug" board).
  const { data: currentBoardData, refetch: refetchCurrentBoard } = useQuery(
    ["boardThemeData", { slug }],
    async (key: string, { slug }) => {
      const boardData = await getBoardData(key, { slug });
      if (!boardData) {
        return;
      }
      const cachedData =
        queryCache.getQueryData<BoardData | undefined>([
          "boardData",
          { slug },
        ]) || null;
      return mergeBoardData(boardData, cachedData);
    },
    {
      initialData: () => {
        return queryCache.getQueryData<BoardsData>("allBoardsData")?.[slug];
      },
      staleTime: Infinity,
      isDataEqual: (oldData: BoardData, newData: BoardData) => {
        const updated = !deepEqual(newData, oldData);
        log(
          `Received new data for single board (${slug}) query. Found: ${
            updated ? "updated" : "NOT updated"
          }`
        );
        return !updated;
      },
      onSuccess: (data) => {
        if (data) {
          log(`Fetched new data for board ${data.slug}`);
          // Update the value of the board whose value we just requested.
          const allBoardsData = queryCache.getQueryData<BoardsData>(
            "allBoardsData"
          );
          if (!allBoardsData?.[data.slug]) {
            return;
          }
          const newBoardData = mergeBoardData(data, allBoardsData[data.slug]);
          const updated = deepEqual(newBoardData, allBoardsData[data.slug]);
          if (!updated) {
            log(
              `Fetched new value for board ${slug}, but no update was found.`
            );
            return;
          }
          queryCache.setQueryData("allBoardsData", newBoardData);
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

  return {
    currentBoardData,
    refetchAllBoards,
    allBoardsData,
    hasUpdates: Object.keys(allBoardsData || {}).some(
      (slug) => allBoardsData![slug].hasUpdates
    ),
    nextPinnedOrder: getNextPinnedOrder(allBoardsData),
  };
};
