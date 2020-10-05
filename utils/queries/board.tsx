import axios from "axios";
import debug from "debug";

import { BoardData, BoardDescription } from "../../types/Types";

const log = debug("bobafrontend:queries:board-log");

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
