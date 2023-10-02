import client from "../client";
import type { GetUserStarFeedQueryResponse, GetUserStarFeedQueryParams } from "../models/GetUserStarFeed";

/**
 * @summary Get current users Star Feed.
 * @link /feeds/users/@me/stars
 */
export function getUserStarFeed <TData = GetUserStarFeedQueryResponse>(params?: GetUserStarFeedQueryParams, options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "get",
    url: `/feeds/users/@me/stars`,
    params,
    ...options
  });
};
