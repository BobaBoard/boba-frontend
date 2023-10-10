import client from "../client";
import type { ResponseConfig } from "../client";
import type { UpdateUserSettingsMutationRequest, UpdateUserSettingsMutationResponse } from "../models/UpdateUserSettings";

/**
 * @summary Updates settings data for the current user.
 * @link /users/@me/settings
 */
export async function updateUserSettings<TData = UpdateUserSettingsMutationResponse,TVariables = UpdateUserSettingsMutationRequest>(data: TVariables, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData, TVariables>({
      method: "patch",
      url: `/users/@me/settings`,
      data,
      ...options
   });
};