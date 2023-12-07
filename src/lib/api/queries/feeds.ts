import {
  GetBoardsFeedByExternalIdPathParams,
  GetBoardsFeedByExternalIdQueryParams,
  GetUserFeedQueryParams,
  getBoardsFeedByExternalId,
  getUserFeed,
} from "lib/api/generated";

import { Camelize } from "utils/typescript-utils";
import { FeedType } from "types/Types";
import debug from "debug";
import { makeClientThreadSummary } from "lib/api/client-data";
import { getBoardsFeedByExternalId } from "kubb/gen";

const log = debug("bobafrontend:queries:feeds-log");

export const getBoardActivityData = async (
  {
    boardId,
    categoryFilter,
  }: Camelize<GetBoardsFeedByExternalIdPathParams> &
    Camelize<GetBoardsFeedByExternalIdQueryParams>,
  cursor?: string
): Promise<FeedType> => {
  log(`Fetching board activity for board with id ${boardId}.`);
  if (!boardId) {
    log(`...can't fetch board activity for board with no id.`);
    // TODO: don't request activity when there's no slug.
    throw new Error("Attempted to fetch board activity with no id");
  }
  const response = await getBoardsFeedByExternalId(boardId, {
    categoryFilter,
    cursor,
  });

  log(
    `Got response for board activity with id ${boardId}. Status: ${response.status}`
  );
  if (response.status == 204) {
    // No data, let's return emptyy
    return { cursor: { next: null }, activity: [] };
  }
  // Transform post to client-side type.
  return {
    cursor: response.data.cursor,
    activity: response.data.activity.map(makeClientThreadSummary),
  };
};

export const getUserActivityData = async (
  params: GetUserFeedQueryParams
): Promise<FeedType> => {
  const response = await getUserFeed(params);
  if (response.status == 204) {
    // No data, let's return empty array
    return { cursor: { next: null }, activity: [] };
  }
  // Transform post to client-side type.
  return {
    cursor: response.data.cursor,
    activity: response.data.activity.map(makeClientThreadSummary),
  };
};
