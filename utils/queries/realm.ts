import axios from "axios";
import { RealmType } from "types/Types";
import { makeClientBoardSummary } from "utils/server-utils";

export const getRealmData = async ({
  realmId,
  baseUrl,
}: {
  realmId: string;
  baseUrl?: string;
}): Promise<RealmType> => {
  let url: URL | null = null;
  if (baseUrl) {
    url = new URL(baseUrl);
    url.pathname = `/realms/slug/${realmId}`;
  }
  const response = await axios.get(
    url ? url.toString() : `/realms/slug/${realmId}`
  );

  const data = response.data;
  return {
    slug: data.slug,
    settings: {
      root: data.settings.root,
      indexPage: data.settings.index_page,
      boardPage: data.settings.board_page,
      threadPage: data.settings.thread_page,
    },
    boards: data.boards.map(makeClientBoardSummary),
  };
};
