import {
  BOBATAN_BOBADEX,
  BOBATAN_USER_DATA,
  BOBATAN_V0_PINNED_BOARDS,
} from "./data/user";

import debug from "debug";
import { rest } from "msw";
import { server } from ".";
import { V0_DATA } from "./data/realm";

const log = debug("bobafrontend:tests:server-mocks:users");

export default [
  rest.get(`/users/@me`, (req, res, ctx) => {
    log("fetching bobatan's user data");
    return res(ctx.status(200), ctx.json(BOBATAN_USER_DATA));
  }),
  rest.get(`/users/@me/pins/realms/${V0_DATA.id}`, (req, res, ctx) => {
    log("fetching bobatan's pinned boards");
    return res(ctx.status(200), ctx.json(BOBATAN_V0_PINNED_BOARDS));
  }),
  rest.patch<{
    username: string;
    avatarUrl: string;
  }>("/users/@me", (req, res, ctx) => {
    log("updating user data to:", req.body);
    if (!req.body?.username || !req.body?.avatarUrl) {
      log("invalid request body");
      throw new Error("invalid request");
    }

    // Now return the updated user data when the user data route is called again.
    server.use(
      rest.get(`/users/@me`, (_, res, ctx) => {
        log("fetching updated user data");
        return res(
          ctx.status(200),
          ctx.json({
            ...BOBATAN_USER_DATA,
            username: req.body.username,
            avatar_url: req.body.avatarUrl,
          })
        );
      })
    );
    return res(
      ctx.status(200),
      ctx.json({
        username: req.body.username,
        avatar_url: req.body.avatarUrl,
      })
    );
  }),
  rest.get("/users/@me/bobadex", (req, res, ctx) => {
    log("fetching bobatan's bobadex");
    return res(ctx.status(200), ctx.json(BOBATAN_BOBADEX));
  }),
];
