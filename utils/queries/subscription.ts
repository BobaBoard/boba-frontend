import { NextPageContext } from "next";
import axios from "axios";
import { getServerBaseUrl } from "../location-utils";

export const getLatestSubscriptionUpdate = async (
  {
    subscriptionId,
  }: {
    subscriptionId: string;
  },
  ctx?: NextPageContext
) => {
  const response = await axios.get(
    `${getServerBaseUrl(ctx)}subscriptions/${subscriptionId}/`
  );
  return response.data;
};
