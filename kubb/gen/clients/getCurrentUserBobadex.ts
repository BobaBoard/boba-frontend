import client from "../client";
import type { GetCurrentUserBobadexQueryResponse } from "../models/GetCurrentUserBobadex";

/**
 * @summary Gets bobadex data for the current user.
 * @link /users/@me/bobadex
 */
export function getCurrentUserBobadex <TData = GetCurrentUserBobadexQueryResponse>(options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "get",
    url: `/users/@me/bobadex`,
    ...options
  });
};
