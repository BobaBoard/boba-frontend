import axios from "axios";
import debug from "debug";

const log = debug("bobafrontend:queries-log");
const info = debug("bobafrontend:queries-info");

export const getBoardData = async (key: string, { slug }: { slug: string }) => {
  log(`Fetching board data for board with slug ${slug}.`);
  if (!slug) {
    log(`...can't fetch board data for board with no slug.`);
    return;
  }
  const response = await axios.get(`boards/${slug}`);
  log(`Got response for board data with slug ${slug}.`);
  info(response.data);
  return response.data;
};

export const getBoardActivityData = async (
  key: string,
  { slug }: { slug: string },
  cursor?: string
) => {
  if (!slug) {
    return;
  }
  const response = await axios.get(`boards/${slug}/activity/latest`, {
    params: { cursor },
  });
  if (response.status == 204) {
    // No data, let's return empty array
    return { cursor: null, activity: [] };
  }
  return response.data;
};

export const getThreadData = async (
  key: string,
  { threadId }: { threadId: string }
) => {
  if (!threadId) {
    return;
  }
  const response = await axios.get(`threads/${threadId}/`);
  return response.data;
};

export const ALL_BOARDS_KEY = "allBoardsData";
export const getAllBoardsData = async (key: string) => {
  log(`Fetching all boards data.`);
  const response = await axios.get(`boards`);
  log(`Got response for all boards data.`);
  info(response.data);

  try {
    // Save response to localstorage to speed up loading
    localStorage.setItem(ALL_BOARDS_KEY, JSON.stringify(response.data));
  } catch (e) {
    log("Error while saving boards to local storage.");
  }

  return response.data;
};

export const dismissAllNotifications = async () => {
  await axios.post(`users/notifications/dismiss`);
  return true;
};

export const markThreadAsRead = async ({ threadId }: { threadId: string }) => {
  log(`Marking thread ${threadId} as read.`);
  await axios.get(`threads/${threadId}/visit`);
  return true;
};
