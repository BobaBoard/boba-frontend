import client from "../client";
import type { GetCurrentUserQueryResponse } from "../models/GetCurrentUser";

/**
 * @summary Gets data for the current user.
 * @link /users/@me
 */
export function getCurrentUser <TData = GetCurrentUserQueryResponse>(options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "get",
    url: `/users/@me`,
    ...options
  });
};
