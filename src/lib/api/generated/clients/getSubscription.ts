import client from "../client";
import type { ResponseConfig } from "../client";
import type { GetSubscriptionQueryResponse, GetSubscriptionPathParams } from "../types/GetSubscription";

/**
     * @summary Gets data for the given subscription. Currently returns only the last update.
     * @link /subscriptions/:subscription_id
     */
export async function getSubscription (subscriptionId: GetSubscriptionPathParams["subscription_id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GetSubscriptionQueryResponse>> {
      return client<GetSubscriptionQueryResponse>({
          method: "get",
        url: `/subscriptions/${subscriptionId}`,
        ...options
      });
};