import axios from "axios";

export const getLatestSubscriptionUpdate = async ({
  subscriptionId,
}: {
  subscriptionId: string;
}) => {
  const response = await axios.get(`/subscriptions/${subscriptionId}/`);
  return response.data;
};
