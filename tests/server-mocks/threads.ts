import {
  FAVORITE_CHARACTER_TO_MAIM_THREAD,
  FAVORITE_MURDER_SCENE_BOBATAN,
} from "./data/thread";

import { rest } from "msw";
import { server } from ".";

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
  rest.post(
    "/threads/29d1b2da-3289-454a-9089-2ed47db4967b/mute",
    (req, res, ctx) => {
      // Now return the thread as muted when the thread endpoints are called again
      server.use(
        rest.get(
          "/threads/29d1b2da-3289-454a-9089-2ed47db4967b/",
          (_, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.json({
                ...FAVORITE_CHARACTER_TO_MAIM_THREAD,
                muted: true,
              })
            );
          }
        )
      );

      return res(ctx.status(204));
    }
  ),
  rest.delete(
    "/threads/29d1b2da-3289-454a-9089-2ed47db4967b/mute",
    (req, res, ctx) => {
      // Now return the thread as muted when the thread endpoints are called again
      server.use(
        rest.get(
          "/threads/29d1b2da-3289-454a-9089-2ed47db4967b/",
          (_, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.json({
                ...FAVORITE_CHARACTER_TO_MAIM_THREAD,
                muted: false,
              })
            );
          }
        )
      );

      return res(ctx.status(204));
    }
  ),
  rest.post(
    "/threads/29d1b2da-3289-454a-9089-2ed47db4967b/hide",
    (req, res, ctx) => {
      // Now return the thread as muted when the thread endpoints are called again
      server.use(
        rest.get(
          "/threads/29d1b2da-3289-454a-9089-2ed47db4967b/",
          (_, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.json({
                ...FAVORITE_CHARACTER_TO_MAIM_THREAD,
                hidden: true,
              })
            );
          }
        )
      );

      return res(ctx.status(204));
    }
  ),
  rest.delete(
    "/threads/29d1b2da-3289-454a-9089-2ed47db4967b/hide",
    (req, res, ctx) => {
      // Now return the thread as muted when the thread endpoints are called again
      server.use(
        rest.get(
          "/threads/29d1b2da-3289-454a-9089-2ed47db4967b/",
          (_, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.json({
                ...FAVORITE_CHARACTER_TO_MAIM_THREAD,
                hidden: false,
              })
            );
          }
        )
      );

      return res(ctx.status(204));
    }
  ),
];
