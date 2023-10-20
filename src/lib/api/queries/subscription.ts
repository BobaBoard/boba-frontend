import { makeClientData, makeClientPost } from "lib/api/client-data";

import { SubscriptionFeed } from "types/Types";
import axios from "axios";

export const getLatestSubscriptionUpdate = async ({
  subscriptionId,
}: {
  subscriptionId: string;
}) => {
  const response = await axios.get(`/subscriptions/${subscriptionId}/`);
  if (!response.data) {
    throw new Error("No subscription data found");
  }
  return {
    cursor: response.data.cursor,
    subscription: makeClientData(response.data.subscription),
    activity: response.data.activity.map(makeClientPost),
  } as SubscriptionFeed;
};
