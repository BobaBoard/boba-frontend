import { SettingType } from "@bobaboard/ui-components";
import axios from "axios";
import debug from "debug";
import { getServerBaseUrl } from "../location-utils";
import { makeClientData } from "utils/client-data";

const log = debug("bobafrontend:queries:user-log");

export const updateUserData = async (data: {
  avatarUrl: string;
  username: string;
}): Promise<{
  avatarUrl: string;
  username: string;
}> => {
  const response = await axios.patch(`/users/@me`, data);
  log(`Updated user data on server:`);
  log(response.data);
  return makeClientData(response.data) as {
    avatarUrl: string;
    username: string;
  };
};

export const getBobadex = async (): Promise<any> => {
  const response = await axios.get(`/users/@me/bobadex`);
  log(`Got user data from server:`);
  log(response.data);
  return response.data;
};

// We create a new axios so we don't have the interceptor for error
// displaying them in a toast. These will be displayed directly in the UI.
const inviteAxios = axios.create();
inviteAxios.defaults.baseURL = getServerBaseUrl();
export const acceptInvite = async (data: {
  email: string;
  password: string;
  nonce: string;
}) => {
  const response = await inviteAxios.post(`/users/invite/accept`, data);
  log(`Returned data from invite API:`);
  log(response.data);
  return response.data;
};

export const getUserSettings = async (): Promise<SettingType> => {
  const response = await axios.get(`/users/@me/settings`);
  log(`Got user settings from server:`);
  log(response.data);
  return response.data;
};

export const updateUserSettings = async (
  name: string,
  value: unknown
): Promise<SettingType> => {
  const response = await axios.patch(`/users/@me/settings`, {
    name,
    value,
  });
  if (response.status !== 200) {
    throw new Error("Error while updating settings.");
  }
  log(`Got user settings from server:`);
  log(response?.data);
  return response?.data;
};

export const dismissRealmNotifications = async ({realmId} : {realmId: string}) => {
  await axios.delete(`/realms/${realmId}/notifications`);
};

// export const getRealmInvites = async (): Promise<any> => {
//   const response = await axios.get(`/realms/${realm_id}/invites`);
//   log(`Got realm invites from server:`);
//   log(response.data);
//   return response.data;
// };

// export const createInvite = async (
//   email: string,
//   label?: unknown
// ): Promise<any> => {
//   const response = await axios.patch(`/realms/${realm_id}/settings`, {
//     email,
//     label,
//   });
//   if (response.status !== 200) {
//     throw new Error("Error while creating invite.");
//   }
//   log(`created invite on the server:`);
//   log(response?.data);
//   return response?.data;
// };

export const dismissAllNotifications = async () => {
  await axios.post(`users/notifications/dismiss`);
  return true;
};
