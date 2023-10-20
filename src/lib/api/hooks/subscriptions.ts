import { QueryClient, useQuery } from "react-query";

import { SubscriptionFeed } from "types/Types";
import { getLatestSubscriptionUpdate } from "lib/api/queries/subscription";

const SUBSCRIPTION_KEY = "subscriptions";

export const useSubscription = ({
  subscriptionId,
}: {
  subscriptionId: string;
}) => {
  const { data: subscriptionData } = useQuery<SubscriptionFeed>(
    [SUBSCRIPTION_KEY, { subscriptionId }],
    () => getLatestSubscriptionUpdate({ subscriptionId }),
    {
      staleTime: Infinity,
    }
  );
  return subscriptionData;
};

export const prefetchSubscriptionData = async (
  queryClient: QueryClient,
  { subscriptionId }: { subscriptionId: string }
) => {
  return await queryClient.setQueryData(
    [SUBSCRIPTION_KEY, { subscriptionId }],
    await getLatestSubscriptionUpdate({ subscriptionId })
  );
};
