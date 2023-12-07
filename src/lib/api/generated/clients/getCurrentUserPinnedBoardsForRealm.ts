import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetCurrentUserPinnedBoardsForRealmQueryResponse, GetCurrentUserPinnedBoardsForRealmPathParams } from "../types/GetCurrentUserPinnedBoardsForRealm";

/**
     * @summary Gets pinned boards for the current user on the current realm.
     * @link /users/@me/pins/realms/:realm_id
     */
export async function getCurrentUserPinnedBoardsForRealm (realmId: GetCurrentUserPinnedBoardsForRealmPathParams["realm_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetCurrentUserPinnedBoardsForRealmQueryResponse>> {
      return client<GetCurrentUserPinnedBoardsForRealmQueryResponse>({
          method: "get",
        url: `/users/@me/pins/realms/${realmId}`,
        ...options
      });
};