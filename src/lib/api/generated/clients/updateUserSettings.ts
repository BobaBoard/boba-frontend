import client from "../client";
import type { ResponseConfig } from "../client";
import type { UpdateUserSettingsMutationRequest, UpdateUserSettingsMutationResponse } from "../types/UpdateUserSettings";

/**
     * @summary Updates settings data for the current user.
     * @link /users/@me/settings
     */
export async function updateUserSettings (data: UpdateUserSettingsMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<UpdateUserSettingsMutationResponse>> {
      return client<UpdateUserSettingsMutationResponse, UpdateUserSettingsMutationRequest>({
          method: "patch",
        url: `/users/@me/settings`,
        data,
        ...options
      });
};