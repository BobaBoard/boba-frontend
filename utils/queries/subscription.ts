import axios from "axios";

export const getLatestSubscriptionUpdate = async (
  key: string,
  {
    subscriptionId,
  }: {
    subscriptionId: string;
  }
) => {
  const response = await axios.get(`/subscriptions/${subscriptionId}/latest`);
  return response.data[0];
};
