import client from "../client";
import type { ResponseConfig } from "../client";
import type { UpdateCurrentUserMutationRequest, UpdateCurrentUserMutationResponse } from "../models/UpdateCurrentUser";

/**
 * @summary Update data for the current user.
 * @link /users/@me
 */
export async function updateCurrentUser<TData = UpdateCurrentUserMutationResponse,TVariables = UpdateCurrentUserMutationRequest>(data: TVariables, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData, TVariables>({
      method: "patch",
      url: `/users/@me`,
      data,
      ...options
   });
};