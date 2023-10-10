import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetUserStarFeedQueryResponse, GetUserStarFeedQueryParams } from "../models/GetUserStarFeed";

/**
 * @summary Get current users Star Feed.
 * @link /feeds/users/@me/stars
 */
export async function getUserStarFeed<TData = GetUserStarFeedQueryResponse>(params?: GetUserStarFeedQueryParams, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "get",
      url: `/feeds/users/@me/stars`,
      params,
      ...options
   });
};