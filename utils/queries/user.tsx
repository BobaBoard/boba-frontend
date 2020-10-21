import axios from "axios";
import debug from "debug";
import { BoardActivityResponse } from "types/Types";
import { makeClientThread } from "../../utils/queries";

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

// TODO: this should belong to a settings utility.
const DEV_SERVER_KEY = "devServer";
let location;
let isStaging = false;
if (typeof window !== "undefined") {
  location = window.location.hostname;
  isStaging = new URL(window.location.href).hostname.startsWith("staging");
}
let devServer = `http://${location}:4200/`;
if (typeof localStorage !== "undefined") {
  const data = localStorage.getItem(DEV_SERVER_KEY);
  if (data) {
    devServer = data;
  }
}

// We create a new axios so we don't have the interceptor for error
// displaying them in a toast. These will be displayed directly in the UI.
const inviteAxios = axios.create();
inviteAxios.defaults.baseURL =
  process.env.NODE_ENV == "production"
    ? isStaging
      ? "https://staging-dot-backend-dot-bobaboard.uc.r.appspot.com/"
      : "https://backend-dot-bobaboard.uc.r.appspot.com/"
    : devServer;
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
  key: string,
  cursor?: string
): Promise<BoardActivityResponse | undefined> => {
  const response = await axios.get(`users/me/feed`, {
    params: { cursor },
  });
  if (response.status == 204) {
    // No data, let's return empty array
    return { nextPageCursor: null, activity: [] };
  }
  // Transform post to client-side type.
  return {
    nextPageCursor: response.data.next_page_cursor || null,
    activity: response.data.activity.map(makeClientThread),
  };
};
