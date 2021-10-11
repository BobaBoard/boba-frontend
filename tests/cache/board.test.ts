import { expect, test } from "@jest/globals";

import { QueryClient } from "react-query";
import { getBoardSummaryInCache } from "../../cache/board";

test("Board is correctly not found in empty cache", () => {
  const queryClient = new QueryClient();
  const boardSummary = getBoardSummaryInCache(queryClient, {
    boardId: "gore",
  });
  expect(boardSummary).toBeNull();
});
