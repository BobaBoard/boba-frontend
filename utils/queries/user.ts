import { SettingType } from "@bobaboard/ui-components";
import axios from "axios";
import debug from "debug";
import { BoardActivityResponse } from "types/Types";
import { getServerBaseUrl, makeClientThread } from "../../utils/server-utils";

const log = debug("bobafrontend:queries:user-log");

export const updateUserData = async (data: {
  avatarUrl: string;
  username: string;
}): Promise<{
  avatarUrl: string;
  username: string;
}> => {
  const response = await axios.post(`/users/me/update`, data);
  log(`Updated user data on server:`);
  log(response.data);
  return response.data;
};

export const getBobadex = async (): Promise<any> => {
  const response = await axios.get(`/users/me/bobadex`);
  log(`Updated user data on server:`);
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
export const getUserActivityData = async (
  params: {
    ownOnly?: boolean;
    updatedOnly?: boolean;
  },
  cursor: string
): Promise<BoardActivityResponse | undefined> => {
  const response = await axios.get(`users/me/feed`, {
    params: { ...params, cursor },
  });
  if (response.status == 204) {
    // No data, let's return empty array
    return { cursor: { next: null }, activity: [] };
  }
  // Transform post to client-side type.
  return {
    cursor: response.data.cursor,
    activity: response.data.activity.map(makeClientThread),
  };
};

export const getUserSettings = async (): Promise<SettingType> => {
  const response = await axios.get(`/users/settings`);
  log(`Got user settings from server:`);
  log(response.data);
  return response.data;
};

export const updateUserSettings = async (
  name: string,
  value: unknown
): Promise<any> => {
  const response = await axios.post(`/users/settings/update`, {
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
