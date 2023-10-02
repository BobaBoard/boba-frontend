import client from "../client";
import type { GetSubscriptionQueryResponse, GetSubscriptionPathParams } from "../models/GetSubscription";

/**
 * @summary Gets data for the given subscription. Currently returns only the last update.
 * @link /subscriptions/:subscription_id
 */
export function getSubscription <TData = GetSubscriptionQueryResponse>(subscriptionId: GetSubscriptionPathParams["subscription_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData>({
    method: "get",
    url: `/subscriptions/${subscriptionId}`,
    ...options
  });
};
