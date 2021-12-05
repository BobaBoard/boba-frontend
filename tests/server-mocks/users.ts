import {
  BOBATAN_BOBADEX,
  BOBATAN_NOTIFICATIONS_DATA,
  BOBATAN_USER_DATA,
} from "./data/user";

import { rest } from "msw";
import { server } from ".";

export default [
  rest.get("/users/@me/notifications", (req, res, ctx) => {
    console.log("fetching bobatan's notification data");
    return res(ctx.status(200), ctx.json(BOBATAN_NOTIFICATIONS_DATA));
  }),
  rest.get("/users/@me", (req, res, ctx) => {
    console.log("fetching bobatan's user data");
    return res(ctx.status(200), ctx.json(BOBATAN_USER_DATA));
  }),
  rest.patch<{
    username: string;
    avatarUrl: string;
  }>("/users/@me", (req, res, ctx) => {
    console.log("updating user data to:", req.body);
    if (!req.body?.username || !req.body?.avatarUrl) {
      console.log("invalid request body");
      throw new Error("invalid request");
    }

    // Now return the created post when the board feed is called again.
    server.use(
      rest.get("/users/@me", (_, res, ctx) => {
        console.log("fetching data for gore feed with new post");
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
    console.log("fetching bobatan's bobadex");
    return res(ctx.status(200), ctx.json(BOBATAN_BOBADEX));
  }),
];
