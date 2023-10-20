import { DetailedRealmInvite, RealmInvite, RealmType } from "types/Types";
import {
  makeClientData,
  makeClientDetailedRealmInvite,
  makeClientRealmInvite,
  makeRealmData,
} from "lib/api/client-data";

import axios from "axios";
import debug from "debug";

const log = debug("bobafrontend:queries:realm-log");
const error = debug("bobafrontend:queries:realm-error");

export const getRealmData = async ({
  realmSlug,
}: {
  realmSlug: string;
}): Promise<RealmType> => {
  const response = await axios.get(`/realms/slug/${realmSlug}`);

  return makeRealmData(response.data) as RealmType;
};

export const getRealmInvites = async ({
  realmId,
}: {
  realmId: string;
}): Promise<DetailedRealmInvite[]> => {
  const response = await axios.get(`/realms/${realmId}/invites`);
  log(`Got realm invites from server:`);
  log(response.data);
  return response.data?.invites.map(makeClientDetailedRealmInvite) || [];
};

export const getInviteStatusByNonce = async ({
  realmId,
  nonce,
}: {
  realmId: string;
  nonce: string;
}): Promise<{
  realmId: string;
  realmSlug: string;
  inviteStatus: "pending" | "used" | "expired";
  requiresEmail: boolean;
} | null> => {
  try {
    const response = await axios.get(`/realms/${realmId}/invites/${nonce}`);
    console.log("response");
    log(`Got invite status from server:`);
    log(response.data);
    return makeClientData(response.data) as {
      realmId: string;
      realmSlug: string;
      inviteStatus: "pending" | "used" | "expired";
      requiresEmail: boolean;
    };
  } catch (e) {
    error(e);
    return null;
  }
};

export const createRealmInvite = async ({
  realmId,
  email,
  label,
}: {
  realmId: string;
  email?: string;
  label?: string;
}): Promise<RealmInvite> => {
  const response = await axios.post(`/realms/${realmId}/invites`, {
    email,
    label,
  });
  if (response.status !== 200) {
    throw new Error("Error while creating invite.");
  }
  log(`created invite on the server:`);
  log(response.data);
  return makeClientRealmInvite(response.data);
};
