import { BoardSummary, RealmType } from "types/Types";
import {
  DRAWN_SUMMARY,
  GORE_BOARD_ID,
  GORE_SUMMARY,
  KPOP_SUMMARY,
} from "../data/BoardSummary";
import {
  addBoardSummaryInCache,
  getBoardSummaryInCache,
  setBoardSummaryInCache,
} from "lib//api/cache/board";
import { expect, test } from "@jest/globals";

import { QueryClient } from "react-query";
import { REALM_QUERY_KEY } from "contexts/RealmContext";

const getV0QueryKey = () => {
  return [REALM_QUERY_KEY, { realmSlug: "v0" }];
};

const getRealmDataFromCache = (queryClient: QueryClient) => {
  return queryClient.getQueryState<RealmType>(getV0QueryKey())?.data;
};

describe("Tests for addBoardSummaryInCache", () => {
  test("BoardSummary is correctly added in cache", () => {
    const originalData = {
      slug: "v0",
      boards: [KPOP_SUMMARY],
    };
    const queryClient = new QueryClient();
    queryClient.setQueryData(getV0QueryKey(), originalData);

    addBoardSummaryInCache(queryClient, {
      realmSlug: "v0",
      summary: GORE_SUMMARY,
    });

    const newData = getRealmDataFromCache(queryClient);
    expect(newData?.boards).toContainEqual(GORE_SUMMARY);
    // Check that the objects have also been correctly updated
    expect(newData).not.toBe(originalData);
    expect(newData?.boards).not.toBe(originalData.boards);
  });

  test("BoardSummary is correctly updated in cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(getV0QueryKey(), {
      slug: "v0",
      boards: [KPOP_SUMMARY],
    });

    const newKpopSummary: BoardSummary = {
      ...KPOP_SUMMARY,
      tagline: "this is an updated description",
    };
    addBoardSummaryInCache(queryClient, {
      realmSlug: "v0",
      summary: newKpopSummary,
    });
    expect(getRealmDataFromCache(queryClient)?.boards).toContainEqual(
      newKpopSummary
    );
  });
});

describe("Tests for getBoardSummaryInCache", () => {
  test("BoardSummary is correctly not found in empty cache", () => {
    const queryClient = new QueryClient();
    const boardSummary = getBoardSummaryInCache(queryClient, {
      boardId: GORE_BOARD_ID,
    });
    expect(boardSummary).toBeNull();
  });

  test("BoardSummary is correctly not found in cache that does not contain it", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(getV0QueryKey(), {
      slug: "v0",
      boards: [KPOP_SUMMARY],
    });

    const boardSummary = getBoardSummaryInCache(queryClient, {
      boardId: GORE_BOARD_ID,
    });
    expect(boardSummary).toBeNull();
  });

  test("BoardSummary is correctly found in cache that contains it", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(getV0QueryKey(), {
      slug: "v0",
      boards: [KPOP_SUMMARY, GORE_SUMMARY, DRAWN_SUMMARY],
    });

    const boardSummary = getBoardSummaryInCache(queryClient, {
      boardId: GORE_BOARD_ID,
    });
    expect(boardSummary).toBe(GORE_SUMMARY);
  });
});

describe("Tests for setBoardSummaryInCache", () => {
  test("BoardSummary is correctly not updated in cache that does not contain it", () => {
    const queryClient = new QueryClient();
    const originalData = {
      slug: "v0",
      boards: [KPOP_SUMMARY, DRAWN_SUMMARY],
    };
    queryClient.setQueryData(getV0QueryKey(), originalData);

    const transform = jest.fn();
    setBoardSummaryInCache(
      queryClient,
      {
        boardId: GORE_BOARD_ID,
      },
      transform
    );

    expect(transform).not.toBeCalled();
  });

  test("BoardSummary is correctly updated in cache that contains it", () => {
    const queryClient = new QueryClient();
    const originalData = {
      slug: "v0",
      boards: [KPOP_SUMMARY, GORE_SUMMARY, DRAWN_SUMMARY],
    };
    queryClient.setQueryData(getV0QueryKey(), originalData);

    const newSummary: BoardSummary = {
      ...GORE_SUMMARY,
      accentColor: "purple",
    };
    setBoardSummaryInCache(
      queryClient,
      {
        boardId: GORE_BOARD_ID,
      },
      () => {
        return newSummary;
      }
    );

    const newData = getRealmDataFromCache(queryClient);
    expect(newData?.boards).toContainEqual(newSummary);
    expect(newData?.boards).not.toContainEqual(GORE_SUMMARY);
    // Check that the objects have also been correctly updated
    expect(newData).not.toBe(originalData);
    expect(newData?.boards).not.toBe(originalData.boards);
  });

  test("BoardSummary is correctly not updated in cache when same entity is passed", () => {
    const queryClient = new QueryClient();
    const originalData = {
      slug: "v0",
      boards: [KPOP_SUMMARY, GORE_SUMMARY, DRAWN_SUMMARY],
    };
    queryClient.setQueryData(getV0QueryKey(), originalData);

    setBoardSummaryInCache(
      queryClient,
      {
        boardId: GORE_BOARD_ID,
      },
      () => {
        return GORE_SUMMARY;
      }
    );

    const newData = getRealmDataFromCache(queryClient);
    expect(newData?.boards).toContainEqual(GORE_SUMMARY);
    // Check that the objects to not have changed references
    expect(newData).toBe(originalData);
    expect(newData?.boards).toBe(originalData.boards);
  });
});
