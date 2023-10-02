import client from "../client";
import type { GetRealmsBySlugQueryResponse, GetRealmsBySlugPathParams } from "../models/GetRealmsBySlug";

/**
 * @summary Fetches the top-level realm metadata by slug.
 * @link /realms/slug/:realm_slug
 */
export function getRealmsBySlug <TData = GetRealmsBySlugQueryResponse>(realmSlug: GetRealmsBySlugPathParams["realm_slug"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "get",
    url: `/realms/slug/${realmSlug}`,
    ...options
  });
};
