import { BOBATAN_GORE_METADATA } from "../data/BoardMetadata";
import { rest } from "msw";

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
];
