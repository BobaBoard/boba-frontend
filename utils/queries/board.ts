import axios from "axios";
import debug from "debug";
import { makeClientBoardData } from "../server-utils";

import { BoardData, BoardDescription } from "../../types/Types";

const log = debug("bobafrontend:queries:board-log");
const info = debug("bobafrontend:queries:board-info");

export const muteBoard = async ({
  slug,
  mute,
}: {
  slug: string;
  mute: boolean;
}) => {
  log(`Updating board ${slug} muted state to ${mute ? "muted" : "unmuted"}.`);
  if (mute) {
    await axios.post(`boards/${slug}/mute`);
  } else {
    await axios.post(`boards/${slug}/unmute`);
  }
  return true;
};

export const pinBoard = async ({
  slug,
  pin,
}: {
  slug: string;
  pin: boolean;
}) => {
  log(`Updating board ${slug} pinned state to ${pin ? "pinned" : "unpinned"}.`);
  if (pin) {
    await axios.post(`boards/${slug}/pin`);
  } else {
    await axios.post(`boards/${slug}/unpin`);
  }
  return true;
};

export const dismissBoardNotifications = async ({ slug }: { slug: string }) => {
  await axios.post(`boards/${slug}/notifications/dismiss`);
  return true;
};

export const updateBoardSettings = async (data: {
  slug: string;
  descriptions: BoardDescription[];
  accentColor: string;
  tagline: string;
}): Promise<BoardData> => {
  const response = await axios.post(`/boards/${data.slug}/metadata/update/`, {
    descriptions: data.descriptions,
    accentColor: data.accentColor,
    tagline: data.tagline,
  });
  log(`Updated board settings on server:`);
  log(response.data);
  return response.data;
};

export const getBoardData = async ({ slug }: { slug: string | null }) => {
  log(`Fetching board data for board with slug ${slug}.`);
  if (!slug) {
    log(`...can't fetch board data for board with no slug.`);
    return null;
  }
  const response = await axios.get(`boards/${slug}`);
  log(`Got response for board data with slug ${slug}.`);
  info(response.data);
  return makeClientBoardData(response.data);
};

export const getAllBoardsData = async (): Promise<BoardData[]> => {
  log(`Fetching all boards data.`);
  const response = await axios.get(`boards`);
  console.log(response.data);
  log(`Got response for all boards data.`);
  info(response.data);

  return response.data?.map(makeClientBoardData) || [];
};
