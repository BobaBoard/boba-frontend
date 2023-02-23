import { BoardMetadata, RealmType } from "types/Types";
import { GORE_LOGGED_IN_SUMMARY, KPOP_SUMMARY } from "../data/BoardSummary";
import {
  PINNED_BOARDS_QUERY_KEY,
  PinnedBoardType,
} from "lib/api/hooks/pinned-boards";
import { expect, test } from "@jest/globals";

import { BOARD_METADATA_KEY } from "lib/api/hooks/board";
import { GORE_METADATA_BOBATAN } from "../data/BoardMetadata";
import { QueryClient } from "react-query";
import { REALM_QUERY_KEY } from "contexts/RealmContext";
import { setBoardPinnedInCache } from "lib//api/cache/board";

const getV0QueryKey = () => {
  return [REALM_QUERY_KEY, { realmSlug: "v0" }];
};

const getRealmDataFromCache = (queryClient: QueryClient) => {
  return queryClient.getQueryState<RealmType>(getV0QueryKey())?.data;
};

const getBoardMetadataFromCache = (
  queryClient: QueryClient,
  { boardId }: { boardId: string }
) => {
  return queryClient.getQueryState<BoardMetadata>([
    BOARD_METADATA_KEY,
    { boardId },
  ])?.data;
};

const getPinnedDataFromCache = (queryClient: QueryClient) => {
  return queryClient.getQueryState<Record<string, PinnedBoardType>>(
    PINNED_BOARDS_QUERY_KEY
  )?.data;
};

describe("Tests for setBoardPinnedInCache", () => {
  test("Existing board is correctly pinned in Realms cache", () => {
    const queryClient = new QueryClient();

    const originalData = {
      slug: "v0",
      boards: [{ ...GORE_LOGGED_IN_SUMMARY, pinned: false }, KPOP_SUMMARY],
    };
    queryClient.setQueryData(getV0QueryKey(), originalData);

    setBoardPinnedInCache(queryClient, {
      boardId: GORE_LOGGED_IN_SUMMARY.id,
      pin: true,
    });

    // Test realm data
    const realmData = getRealmDataFromCache(queryClient);
    expect(realmData).toEqual({
      slug: "v0",
      boards: [{ ...GORE_LOGGED_IN_SUMMARY, pinned: true }, KPOP_SUMMARY],
    });
    // Check that the objects have also been correctly updated
    expect(realmData).not.toBe(originalData);
    expect(realmData?.boards).not.toBe(originalData.boards);

    const pinnedData = getPinnedDataFromCache(queryClient);
    expect(pinnedData).toEqual({
      [GORE_LOGGED_IN_SUMMARY.id]: {
        ...GORE_LOGGED_IN_SUMMARY,
        pinned: true,
        pinnedIndex: 1,
      },
    });

    // Check that no data was added in other caches, since the
    // data did not exist.
    expect(
      getBoardMetadataFromCache(queryClient, {
        boardId: GORE_LOGGED_IN_SUMMARY.id,
      })
    ).toBeUndefined();
  });

  test("Board is correctly added in pinned boards cache (if sunmary exists)", () => {
    const queryClient = new QueryClient();

    const originalData = {
      slug: "v0",
      boards: [{ ...GORE_LOGGED_IN_SUMMARY, pinned: false }, KPOP_SUMMARY],
    };
    queryClient.setQueryData(getV0QueryKey(), originalData);

    setBoardPinnedInCache(queryClient, {
      boardId: GORE_LOGGED_IN_SUMMARY.id,
      pin: true,
    });

    // Test pinned board data
    const pinnedData = getPinnedDataFromCache(queryClient);
    expect(pinnedData?.[GORE_LOGGED_IN_SUMMARY.id]).toEqual({
      ...GORE_LOGGED_IN_SUMMARY,
      pinned: true,
      pinnedIndex: 1,
    });

    // Check realm data was also updated
    const realmData = getRealmDataFromCache(queryClient);
    expect(realmData).toEqual({
      slug: "v0",
      boards: [{ ...GORE_LOGGED_IN_SUMMARY, pinned: true }, KPOP_SUMMARY],
    });

    // Check that no data was added in other caches, since the
    // data did not exist.
    expect(
      getBoardMetadataFromCache(queryClient, {
        boardId: GORE_LOGGED_IN_SUMMARY.id,
      })
    ).toBeUndefined();
  });

  test("Existing board is correctly removed from pinned boards cache", () => {
    const queryClient = new QueryClient();

    const pinnedBoardOriginalData: Record<string, PinnedBoardType> = {
      [GORE_LOGGED_IN_SUMMARY.id]: {
        ...GORE_LOGGED_IN_SUMMARY,
        pinned: false,
        pinnedIndex: 1,
      },
    };
    queryClient.setQueryData<Record<string, PinnedBoardType>>(
      PINNED_BOARDS_QUERY_KEY,
      pinnedBoardOriginalData
    );

    setBoardPinnedInCache(queryClient, {
      boardId: GORE_LOGGED_IN_SUMMARY.id,
      pin: false,
    });

    // Test pinned board data
    const pinnedData = getPinnedDataFromCache(queryClient);
    expect(pinnedData?.[GORE_LOGGED_IN_SUMMARY.id]).toBeUndefined();

    // Check that no data was added in other caches, since the
    // data did not exist.
    expect(
      getBoardMetadataFromCache(queryClient, {
        boardId: GORE_LOGGED_IN_SUMMARY.id,
      })
    ).toBeUndefined();
    expect(getRealmDataFromCache(queryClient)).toBeUndefined();
  });

  test("Existing board is correctly left in pinned boards cache", () => {
    const queryClient = new QueryClient();

    const pinnedBoardOriginalData: Record<string, PinnedBoardType> = {
      [GORE_LOGGED_IN_SUMMARY.id]: {
        ...GORE_LOGGED_IN_SUMMARY,
        pinned: true,
        pinnedIndex: 1,
      },
    };
    queryClient.setQueryData<Record<string, PinnedBoardType>>(
      PINNED_BOARDS_QUERY_KEY,
      pinnedBoardOriginalData
    );

    setBoardPinnedInCache(queryClient, {
      boardId: GORE_LOGGED_IN_SUMMARY.id,
      pin: true,
    });

    // Test pinned board data
    const pinnedData = getPinnedDataFromCache(queryClient);
    expect(pinnedData).toBe(pinnedBoardOriginalData);

    // Check that no data was added in other caches, since the
    // data did not exist.
    expect(
      getBoardMetadataFromCache(queryClient, {
        boardId: GORE_LOGGED_IN_SUMMARY.id,
      })
    ).toBeUndefined();
    expect(getRealmDataFromCache(queryClient)).toBeUndefined();
  });

  test("Existing board is correctly pinned in metadata cache", () => {
    const queryClient = new QueryClient();

    const originalMetadata = { ...GORE_METADATA_BOBATAN, pinned: false };
    queryClient.setQueryData(
      [BOARD_METADATA_KEY, { boardId: GORE_LOGGED_IN_SUMMARY.id }],
      originalMetadata
    );

    setBoardPinnedInCache(queryClient, {
      boardId: GORE_LOGGED_IN_SUMMARY.id,
      pin: true,
    });

    // Test board metadata
    const boardMetadata = getBoardMetadataFromCache(queryClient, {
      boardId: GORE_LOGGED_IN_SUMMARY.id,
    });
    expect(boardMetadata).toEqual({
      ...originalMetadata,
      pinned: true,
    });
    expect(boardMetadata).not.toBe(originalMetadata);

    // TODO: add method to add pinned from metadata cache (extract summary)
    const pinnedData = getPinnedDataFromCache(queryClient);
    expect(pinnedData).toEqual({
      [GORE_LOGGED_IN_SUMMARY.id]: {
        ...GORE_LOGGED_IN_SUMMARY,
        pinned: true,
        pinnedIndex: 1,
      },
    });

    // Check that no data was added in other caches, since the
    // data did not exist.
    expect(getRealmDataFromCache(queryClient)).toBeUndefined();
  });
});
