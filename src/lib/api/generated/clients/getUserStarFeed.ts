import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetUserStarFeedQueryResponse, GetUserStarFeedQueryParams } from "../types/GetUserStarFeed";

/**
     * @summary Get current users Star Feed.
     * @link /feeds/users/@me/stars
     */
export async function getUserStarFeed (params?: GetUserStarFeedQueryParams, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetUserStarFeedQueryResponse>> {
      return client<GetUserStarFeedQueryResponse>({
          method: "get",
        url: `/feeds/users/@me/stars`,
        params,
        ...options
      });
};