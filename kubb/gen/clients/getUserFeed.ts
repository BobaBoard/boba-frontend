import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetUserFeedQueryResponse, GetUserFeedQueryParams } from "../models/GetUserFeed";

/**
 * @summary Get the feed for the current user activity activity.
 * @link /feeds/users/@me
 */
export async function getUserFeed<TData = GetUserFeedQueryResponse>(params?: GetUserFeedQueryParams, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "get",
      url: `/feeds/users/@me`,
      params,
      ...options
   });
};