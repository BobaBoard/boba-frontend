import { PostData, ThreadType } from "types/Types";

import axios from "axios";
import debug from "debug";
import { makeClientThread } from "../client-data";

const log = debug("bobafrontend:queries:thread-log");

export const getThreadData = async ({
  threadId,
}: {
  threadId: string;
}): Promise<ThreadType> => {
  if (!threadId) {
    log(`...can't fetch thread with no id.`);
    // TODO: don't request thread when there's no id.
    throw new Error("Attempted to fetch thread with no id.");
  }
  const response = await axios.get(`threads/${threadId}/`);
  log(`Fetched data for thread with id ${threadId}`);
  return makeClientThread(response.data);
};

export const markThreadAsRead = async ({ threadId }: { threadId: string }) => {
  log(`Marking thread ${threadId} as read.`);
  await axios.post(`threads/${threadId}/visits`);
  return true;
};

export const muteThread = async ({
  threadId,
  mute,
}: {
  threadId: string;
  mute: boolean;
}) => {
  log(`Updating thread ${threadId} muted state.`);
  if (mute) {
    await axios.post(`threads/${threadId}/mute`);
  } else {
    await axios.delete(`threads/${threadId}/mute`);
  }
  return true;
};

export const hideThread = async ({
  threadId,
  hide,
}: {
  threadId: string;
  hide: boolean;
}) => {
  log(`Updating thread ${threadId} hidden state.`);
  if (hide) {
    await axios.post(`threads/${threadId}/hide`);
  } else {
    await axios.delete(`threads/${threadId}/hide`);
  }
  return true;
};

export const createThread = async (
  boardId: string,
  postData: PostData
): Promise<ThreadType> => {
  const response = await axios.post(`/boards/${boardId}`, postData);
  log(`Received thread from server:`);
  log(response.data);
  return makeClientThread(response.data);
};
