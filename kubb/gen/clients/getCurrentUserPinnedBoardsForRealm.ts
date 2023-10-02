import client from "../client";
import type { GetCurrentUserPinnedBoardsForRealmQueryResponse, GetCurrentUserPinnedBoardsForRealmPathParams } from "../models/GetCurrentUserPinnedBoardsForRealm";

/**
 * @summary Gets pinned boards for the current user on the current realm.
 * @link /users/@me/pins/realms/:realm_id
 */
export function getCurrentUserPinnedBoardsForRealm <TData = GetCurrentUserPinnedBoardsForRealmQueryResponse>(realmId: GetCurrentUserPinnedBoardsForRealmPathParams["realm_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "get",
    url: `/users/@me/pins/realms/${realmId}`,
    ...options
  });
};
