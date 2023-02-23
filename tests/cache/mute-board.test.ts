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
import { setBoardMutedInCache } from "lib//api/cache/board";

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

describe("Tests for setBoardMutedInCache", () => {
  test("Existing board is correctly muted in Realms cache", () => {
    const queryClient = new QueryClient();

    const originalData = {
      slug: "v0",
      boards: [{ ...GORE_LOGGED_IN_SUMMARY, muted: false }, KPOP_SUMMARY],
    };
    queryClient.setQueryData(getV0QueryKey(), originalData);

    setBoardMutedInCache(queryClient, {
      boardId: GORE_LOGGED_IN_SUMMARY.id,
      mute: true,
    });

    // Test realm data
    const realmData = getRealmDataFromCache(queryClient);
    expect(realmData).toEqual({
      slug: "v0",
      boards: [{ ...GORE_LOGGED_IN_SUMMARY, muted: true }, KPOP_SUMMARY],
    });
    // Check that the objects have also been correctly updated
    expect(realmData).not.toBe(originalData);
    expect(realmData?.boards).not.toBe(originalData.boards);

    // Check that no data was added in other caches, since the
    // data did not exist.
    expect(getPinnedDataFromCache(queryClient)).toBeUndefined();
    expect(
      getBoardMetadataFromCache(queryClient, {
        boardId: GORE_LOGGED_IN_SUMMARY.id,
      })
    ).toBeUndefined();
  });

  test("Existing board is correctly muted in pinned boards cache", () => {
    const queryClient = new QueryClient();

    const pinnedBoardOriginalData: Record<string, PinnedBoardType> = {
      [GORE_LOGGED_IN_SUMMARY.id]: {
        ...GORE_LOGGED_IN_SUMMARY,
        muted: false,
        pinnedIndex: 1,
      },
    };
    queryClient.setQueryData<Record<string, PinnedBoardType>>(
      PINNED_BOARDS_QUERY_KEY,
      pinnedBoardOriginalData
    );

    setBoardMutedInCache(queryClient, {
      boardId: GORE_LOGGED_IN_SUMMARY.id,
      mute: true,
    });

    // Test pinned board data
    const pinnedData = getPinnedDataFromCache(queryClient);
    expect(pinnedData?.[GORE_LOGGED_IN_SUMMARY.id]).toEqual({
      ...pinnedBoardOriginalData[GORE_LOGGED_IN_SUMMARY.id],
      muted: true,
    });
    // Check that the objects have also been correctly updated
    expect(pinnedData).not.toBe(pinnedBoardOriginalData);
    expect(pinnedData?.[GORE_LOGGED_IN_SUMMARY.id]).not.toBe(
      pinnedBoardOriginalData[GORE_LOGGED_IN_SUMMARY.id]
    );

    // Check that no data was added in other caches, since the
    // data did not exist.
    expect(
      getBoardMetadataFromCache(queryClient, {
        boardId: GORE_LOGGED_IN_SUMMARY.id,
      })
    ).toBeUndefined();
    expect(getRealmDataFromCache(queryClient)).toBeUndefined();
  });

  test("Existing board is correctly muted in metadata cache", () => {
    const queryClient = new QueryClient();

    const originalMetadata = { ...GORE_METADATA_BOBATAN, muted: false };
    queryClient.setQueryData(
      [BOARD_METADATA_KEY, { boardId: GORE_LOGGED_IN_SUMMARY.id }],
      originalMetadata
    );

    setBoardMutedInCache(queryClient, {
      boardId: GORE_LOGGED_IN_SUMMARY.id,
      mute: true,
    });

    // Test board metadata
    const boardMetadata = getBoardMetadataFromCache(queryClient, {
      boardId: GORE_LOGGED_IN_SUMMARY.id,
    });
    expect(boardMetadata).toEqual({
      ...originalMetadata,
      muted: true,
    });
    expect(boardMetadata).not.toBe(originalMetadata);

    // Check that no data was added in other caches, since the
    // data did not exist.
    expect(getRealmDataFromCache(queryClient)).toBeUndefined();
    expect(getPinnedDataFromCache(queryClient)).toBeUndefined();
  });
});
