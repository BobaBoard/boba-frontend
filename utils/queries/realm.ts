import { RealmType } from "types/Types";
import axios from "axios";
import { makeRealmData } from "utils/client-data";

export const getRealmData = async ({
  realmSlug,
  baseUrl,
}: {
  realmSlug: string;
  baseUrl?: string;
}): Promise<RealmType> => {
  let url: URL | null = null;
  if (baseUrl && realmSlug) {
    url = new URL(baseUrl);
    url.pathname = `/realms/slug/${realmSlug}`;
  }
  const response = await axios.get(
    url ? url.toString() : `/realms/slug/${realmSlug}`
  );

  return makeRealmData(response.data);
};
