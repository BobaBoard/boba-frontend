import client from "../client";
import type { UpdateCurrentUserMutationRequest, UpdateCurrentUserMutationResponse } from "../models/UpdateCurrentUser";

/**
 * @summary Update data for the current user.
 * @link /users/@me
 */
export function updateCurrentUser <TData = UpdateCurrentUserMutationResponse, TVariables = UpdateCurrentUserMutationRequest>(data: TVariables, options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData, TVariables>({
    method: "patch",
    url: `/users/@me`,
    data,
    ...options
  });
};
