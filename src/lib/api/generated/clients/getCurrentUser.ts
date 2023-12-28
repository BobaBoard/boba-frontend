import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetCurrentUserQueryResponse } from "../types/GetCurrentUser";

/**
     * @summary Gets data for the current user.
     * @link /users/@me
     */
export async function getCurrentUser (options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetCurrentUserQueryResponse>> {
      return client<GetCurrentUserQueryResponse>({
          method: "get",
        url: `/users/@me`,
        ...options
      });
};