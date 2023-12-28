import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetRealmsBySlugQueryResponse, GetRealmsBySlugPathParams } from "../types/GetRealmsBySlug";

/**
     * @summary Fetches the top-level realm metadata by slug.
     * @link /realms/slug/:realm_slug
     */
export async function getRealmsBySlug (realmSlug: GetRealmsBySlugPathParams["realm_slug"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetRealmsBySlugQueryResponse>> {
      return client<GetRealmsBySlugQueryResponse>({
          method: "get",
        url: `/realms/slug/${realmSlug}`,
        ...options
      });
};