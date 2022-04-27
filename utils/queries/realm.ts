import { RealmType } from "types/Types";
import axios from "axios";
import debug from "debug";
import { makeRealmData } from "utils/client-data";
import { useRealmId } from "contexts/RealmContext";

const log = debug("bobafrontend:queries:realm-log");

export const getRealmData = async ({
  realmSlug,
}: {
  realmSlug: string;
}): Promise<RealmType> => {
  const response = await axios.get(`/realms/slug/${realmSlug}`);

  return makeRealmData(response.data);
};

export const getRealmInvites = async (realmId: string): Promise<any> => {
  const response = await axios.get(`/realms/${realmId}/invites`);
  log(`Got realm invites from server:`);
  log(response.data);
  return response.data;
};

export const createInvite = async (
  realmId: string,
  email: string,
  label?: unknown
): Promise<any> => {
  const response = await axios.patch(`/realms/${realmId}/settings`, {
    email,
    label,
  });
  if (response.status !== 200) {
    throw new Error("Error while creating invite.");
  }
  log(`created invite on the server:`);
  log(response?.data);
  return response?.data;
};
