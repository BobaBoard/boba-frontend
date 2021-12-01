import {
  FAVORITE_CHARACTER_TO_MAIM_THREAD,
  FAVORITE_MURDER_SCENE_BOBATAN,
} from "./data/thread";

import { rest } from "msw";

export default [
  // TODO: remove the trailing /
  rest.get(
    "/threads/29d1b2da-3289-454a-9089-2ed47db4967b/",
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(FAVORITE_CHARACTER_TO_MAIM_THREAD));
    }
  ),
  rest.get(`/threads/${FAVORITE_MURDER_SCENE_BOBATAN.id}/`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(FAVORITE_MURDER_SCENE_BOBATAN));
  }),
  rest.post(
    "/threads/29d1b2da-3289-454a-9089-2ed47db4967b/visits",
    (req, res, ctx) => {
      return res(ctx.status(200));
    }
  ),
];
