import { BOBATAN_BOBADEX, BOBATAN_USER_DATA } from "./data/user";

import { LOGGED_IN_V0_DATA } from "./data/realm";
import debug from "debug";
import { rest } from "msw";
import { server } from ".";

const log = debug("bobafrontend:tests:server-mocks:users");

export default [
  rest.get("/users/@me", (req, res, ctx) => {
    log("fetching bobatan's user data");
    return res(ctx.status(200), ctx.json(BOBATAN_USER_DATA));
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

    // Now return the created post when the board feed is called again.
    server.use(
      rest.get("/users/@me", (_, res, ctx) => {
        log("fetching data for gore feed with new post");
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
  rest.get(`/realms/${LOGGED_IN_V0_DATA.id}/bobadex`, (req, res, ctx) => {
    log("fetching bobatan's bobadex");
    return res(ctx.status(200), ctx.json(BOBATAN_BOBADEX));
  }),
];
