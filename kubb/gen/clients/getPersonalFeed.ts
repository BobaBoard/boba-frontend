import client from "../client";
import type { GetPersonalFeedQueryResponse, GetPersonalFeedQueryParams } from "../models/GetPersonalFeed";

/**
 * @summary Get the feed for the current user activity activity.
 * @link /feeds/users/@me
 */
export function getPersonalFeed <TData = GetPersonalFeedQueryResponse>(params?: GetPersonalFeedQueryParams, options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "get",
    url: `/feeds/users/@me`,
    params,
    ...options
  });
};
