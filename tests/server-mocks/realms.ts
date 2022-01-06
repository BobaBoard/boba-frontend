import { LOGGED_IN_V0_DATA } from "./data/realm";
import debug from "debug";
import { rest } from "msw";

const log = debug("bobafrontend:tests:server-mocks:realms");

export default [
  rest.get("/realms/slug/v0", (req, res, ctx) => {
    log("fetching data for v0 realm");
    return res(ctx.status(200), ctx.json(LOGGED_IN_V0_DATA));
  }),
];
