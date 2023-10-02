import client from "../client";
import type { GetUserSettingsQueryResponse } from "../models/GetUserSettings";

/**
 * @summary Gets settings data for the current user.
 * @link /users/@me/settings
 */
export function getUserSettings <TData = GetUserSettingsQueryResponse>(options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "get",
    url: `/users/@me/settings`,
    ...options
  });
};
