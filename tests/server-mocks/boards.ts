import { BOBATAN_GORE_METADATA } from "./data/board-metadata";
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
];
