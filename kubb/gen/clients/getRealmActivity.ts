import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetRealmActivityQueryResponse, GetRealmActivityPathParams, GetRealmActivityQueryParams } from "../models/GetRealmActivity";

/**
 * @summary Get latest activity on entire realm
 * @link /feeds/realms/:realm_id
 */
export async function getRealmActivity<TData = GetRealmActivityQueryResponse>(realmId: GetRealmActivityPathParams["realm_id"], params?: GetRealmActivityQueryParams, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData>({
      method: "get",
      url: `/feeds/realms/${realmId}`,
      params,
      ...options
   });
};