import axios from "axios";

export const getRealmData = async ({ realmId }: { realmId: string }) => {
  const response = await axios.get(`/realms/${realmId}`);

  return response.data;
};
