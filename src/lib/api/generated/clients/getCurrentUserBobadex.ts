import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetCurrentUserBobadexQueryResponse } from "../types/GetCurrentUserBobadex";

/**
     * @summary Gets bobadex data for the current user.
     * @link /users/@me/bobadex
     */
export async function getCurrentUserBobadex (options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetCurrentUserBobadexQueryResponse>> {
      return client<GetCurrentUserBobadexQueryResponse>({
          method: "get",
        url: `/users/@me/bobadex`,
        ...options
      });
};