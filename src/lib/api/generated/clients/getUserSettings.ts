import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetUserSettingsQueryResponse } from "../types/GetUserSettings";

/**
     * @summary Gets settings data for the current user.
     * @link /users/@me/settings
     */
export async function getUserSettings (options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetUserSettingsQueryResponse>> {
      return client<GetUserSettingsQueryResponse>({
          method: "get",
        url: `/users/@me/settings`,
        ...options
      });
};