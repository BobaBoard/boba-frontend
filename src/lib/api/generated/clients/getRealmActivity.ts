import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetRealmActivityQueryResponse, GetRealmActivityPathParams, GetRealmActivityQueryParams } from "../types/GetRealmActivity";

/**
     * @summary Get latest activity on entire realm
     * @link /feeds/realms/:realm_id
     */
export async function getRealmActivity (realmId: GetRealmActivityPathParams["realm_id"], params?: GetRealmActivityQueryParams, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetRealmActivityQueryResponse>> {
      return client<GetRealmActivityQueryResponse>({
          method: "get",
        url: `/feeds/realms/${realmId}`,
        params,
        ...options
      });
};