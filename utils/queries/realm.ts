import { RealmType } from "types/Types";
import axios from "axios";
import { makeRealmData } from "utils/client-data";

export const getRealmData = async ({
  realmSlug,
}: {
  realmSlug: string;
}): Promise<RealmType> => {
  const response = await axios.get(`/realms/slug/${realmSlug}`);

  return makeRealmData(response.data);
};
