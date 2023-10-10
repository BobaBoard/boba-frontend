import {
  GetBoardsFeedByExternalIdPathParams,
  GetBoardsFeedByExternalIdQueryParams,
  GetBoardsFeedByExternalIdQueryResponse,
  GetUserFeedQueryParams,
  GetUserFeedQueryResponse,
} from "kubb/gen";

import { FeedType } from "types/Types";
import axios from "axios";
import debug from "debug";
import { makeClientThreadSummary } from "lib/api/client-data";
import { getBoardsFeedByExternalId } from "kubb/gen";

const log = debug("bobafrontend:queries:feeds-log");

export type CamelizeString<ObjectProperty extends string> =
  ObjectProperty extends `${infer F}_${infer R}`
    ? `${F}${Capitalize<CamelizeString<R>>}`
    : ObjectProperty;

export type Camelize<GenericObject> = {
  [ObjectProperty in keyof GenericObject as CamelizeString<
    ObjectProperty & string
  >]: GenericObject[ObjectProperty] extends Array<infer ArrayItem>
    ? ArrayItem extends Record<string, unknown>
      ? Array<Camelize<ArrayItem>>
      : GenericObject[ObjectProperty]
    : GenericObject[ObjectProperty] extends Record<string, unknown>
    ? Camelize<GenericObject[ObjectProperty]>
    : GenericObject[ObjectProperty];
};

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
  const response = await axios.get<GetBoardsFeedByExternalIdQueryResponse>(
    `feeds/boards/${boardId}`,
    {
      params: { categoryFilter, cursor },
    }
  );

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
  params: GetUserFeedQueryParams["filter"],
  cursor?: string
): Promise<FeedType> => {
  const response = await axios.get<GetUserFeedQueryResponse>(
    `feeds/users/@me`,
    {
      params: { ...params, cursor },
    }
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
