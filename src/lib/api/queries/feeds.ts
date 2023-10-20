import { FeedType } from "types/Types";
import axios from "axios";
import debug from "debug";
import { makeClientThreadSummary } from "lib/api/client-data";

const log = debug("bobafrontend:queries:feeds-log");

export const getBoardActivityData = async (
  {
    boardId,
    categoryFilter,
    realmId,
  }: { boardId: string | null; categoryFilter: string | null; realmId: string },
  cursor?: string
): Promise<FeedType> => {
  log(`Fetching board activity for board with id ${boardId}.`);
  if (!boardId) {
    log(`...can't fetch board activity for board with no id.`);
    // TODO: don't request activity when there's no slug.
    throw new Error("Attempted to fetch board activity with no id");
  }
  const response = await axios.get(`feeds/boards/${boardId}`, {
    params: { cursor, categoryFilter, realmId },
  });
  log(
    `Got response for board activity with id ${boardId}. Status: ${response.status}`
  );

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

export const getUserActivityData = async (
  params: {
    ownOnly?: boolean;
    updatedOnly?: boolean;
    realmId: string;
  },
  cursor: string
): Promise<FeedType> => {
  const response = await axios.get(`feeds/users/@me`, {
    params: { ...params, cursor },
  });
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
