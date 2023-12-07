import client from "../client";
import type { ResponseConfig } from "../client";
import type { UpdateCurrentUserMutationRequest, UpdateCurrentUserMutationResponse } from "../types/UpdateCurrentUser";

/**
     * @summary Update data for the current user.
     * @link /users/@me
     */
export async function updateCurrentUser (data: UpdateCurrentUserMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<UpdateCurrentUserMutationResponse>> {
      return client<UpdateCurrentUserMutationResponse, UpdateCurrentUserMutationRequest>({
          method: "patch",
        url: `/users/@me`,
        data,
        ...options
      });
};