import client from "../client";
import type { ResponseConfig } from "../client";
import type { MuteThreadByExternalIdMutationResponse, MuteThreadByExternalIdPathParams } from "../models/MuteThreadByExternalId";

/**
 * @description Mutes the specified thread for the current user.
 * @summary Mutes a thread.
 * @link /threads/:thread_id/mute
 */
export async function muteThreadByExternalId<TData = MuteThreadByExternalIdMutationResponse>(threadId: MuteThreadByExternalIdPathParams["thread_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "post",
      url: `/threads/${threadId}/mute`,
      ...options
   });
};