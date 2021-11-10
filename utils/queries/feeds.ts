import { FeedType } from "types/Types";
import axios from "axios";
import debug from "debug";
import { makeClientThreadSummary } from "../client-data";

const log = debug("bobafrontend:queries:feeds-log");

export const getBoardActivityData = async (
  {
    slug,
    categoryFilter,
  }: { slug: string | null; categoryFilter: string | null },
  cursor?: string
): Promise<FeedType | undefined> => {
  log(`Fetching board activity for board with slug ${slug}.`);
  if (!slug) {
    log(`...can't fetch board activity for board with no slug.`);
    // TODO: don't request activity when there's no slug.
    throw new Error("Attempted to fetch board activity with no slug");
  }
  const response = await axios.get(`feeds/boards/${slug}/`, {
    params: { cursor, categoryFilter },
  });
  log(
    `Got response for board activity with slug ${slug}. Status: ${response.status}`
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
  },
  cursor: string
): Promise<FeedType | undefined> => {
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
