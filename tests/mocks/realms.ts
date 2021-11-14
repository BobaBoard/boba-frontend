import { V0_DATA } from "../data/Realm";
import { rest } from "msw";

export default [
  rest.get(/\/realms\/slug\/v0/, (req, res, ctx) => {
    console.log("fetching data for v0 realm");
    return res(ctx.status(200), ctx.json(V0_DATA));
  }),
];
