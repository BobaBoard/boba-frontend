import { BOBATAN_GORE_FEED } from "./data/feed-board";
import { rest } from "msw";

export default [
  rest.get(
    "/feeds/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec",
    (req, res, ctx) => {
      console.log("fetching data for gore feed");
      return res(ctx.status(200), ctx.json(BOBATAN_GORE_FEED));
    }
  ),
];
