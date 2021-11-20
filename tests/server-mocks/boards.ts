import { BOBATAN_GORE_METADATA } from "./data/board-metadata";
import { BOBATAN_USER_DATA } from "./data/user";
import { rest } from "msw";
import { server } from ".";

export default [
  rest.get("/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec", (req, res, ctx) => {
    console.log("fetching data for gore board");
    return res(ctx.status(200), ctx.json(BOBATAN_GORE_METADATA));
  }),
  rest.post(
    "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/visits",
    (req, res, ctx) => {
      console.log("marking gore board as visited");
      return res(ctx.status(204));
    }
  ),
  rest.post(
    "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/mute",
    (req, res, ctx) => {
      console.log("marking gore board as muted");

      server.use(
        rest.get(
          "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          (req, res, ctx) => {
            console.log("fetching data for gore board (muted)");
            return res(
              ctx.status(200),
              ctx.json({ ...BOBATAN_GORE_METADATA, muted: true })
            );
          }
        )
      );
      return res(ctx.status(204));
    }
  ),
  rest.delete(
    "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/pin",
    (req, res, ctx) => {
      console.log("unpinning gore board");

      server.use(
        rest.get(
          "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          (req, res, ctx) => {
            console.log("fetching data for gore board (muted)");
            return res(
              ctx.status(200),
              ctx.json({ ...BOBATAN_GORE_METADATA, pinned: false })
            );
          }
        ),
        rest.get(/\/users\/@me/, (req, res, ctx) => {
          console.log("fetching bobatan's user data (gore unpinned)");
          const { gore, ...otherBoards } = BOBATAN_USER_DATA.pinned_boards;
          return res(
            ctx.status(200),
            ctx.json({
              ...BOBATAN_USER_DATA,
              pinned_boards: otherBoards,
            })
          );
        })
      );

      return res(ctx.status(204));
    }
  ),
];
