import axios from "axios";
import debug from "debug";

import { BoardData, BoardDescription } from "../../types/Types";

const log = debug("bobafrontend:queries:admin-log");

export const updateBardSettings = async (data: {
  slug: string;
  descriptions: BoardDescription[];
}): Promise<BoardData> => {
  const response = await axios.post(`/boards/${data.slug}/update/`, {
    descriptions: data.descriptions,
  });
  log(`Updated board settings on server:`);
  log(response.data);
  return response.data;
};
