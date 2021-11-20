import { LOGGED_IN_V0_DATA } from "./data/realm";
import { rest } from "msw";

export default [
  rest.get("/realms/slug/v0", (req, res, ctx) => {
    console.log("fetching data for v0 realm");
    return res(ctx.status(200), ctx.json(LOGGED_IN_V0_DATA));
  }),
];
