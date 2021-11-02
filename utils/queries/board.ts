import { BoardData, BoardDescription, BoardMetadata } from "../../types/Types";
import {
  makeClientBoardData,
  makeClientBoardSummary,
  makeClientPermissions,
  makeClientRole,
} from "../client-data";

import axios from "axios";
import debug from "debug";

const error = debug("bobafrontend:queries:board-error");
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
    await axios.delete(`boards/${slug}/mute`);
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
    await axios.delete(`boards/${slug}/pin`);
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

export const getBoardMetadata = async ({
  boardId,
}: {
  boardId: string;
}): Promise<BoardMetadata | null> => {
  const data = (await axios.get(`/boards/${boardId}`))?.data;
  if (!data) {
    error(`Board with id ${boardId} was not found`);
    return null;
  }
  const summary = makeClientBoardSummary(data);
  return {
    ...summary,
    descriptions: data.descriptions,
    permissions: data.permissions
      ? makeClientPermissions(data.permissions)
      : undefined,
    postingIdentities:
      data.posting_identities?.map(makeClientRole) || undefined,
    accessories: data.accessories,
  };
};

export const getAllBoardsData = async (): Promise<BoardData[]> => {
  log(`Fetching all boards data.`);
  const response = await axios.get(`boards`);
  log(`Got response for all boards data.`);
  info(response.data);

  return response.data?.map(makeClientBoardData) || [];
};
