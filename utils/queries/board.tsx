import axios from "axios";
import debug from "debug";

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
