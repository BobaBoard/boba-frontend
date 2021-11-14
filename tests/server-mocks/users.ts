import {
  BOBATAN_NOTIFICATIONS_DATA,
  BOBATAN_USER_DATA,
} from "../data/UserData";

import { rest } from "msw";

export default [
  rest.get(/\/users\/@me\/notifications/, (req, res, ctx) => {
    console.log("fetching bobatan's notification data");
    return res(ctx.status(200), ctx.json(BOBATAN_NOTIFICATIONS_DATA));
  }),
  rest.get(/\/users\/@me/, (req, res, ctx) => {
    console.log("fetching bobatan's user data");
    return res(ctx.status(200), ctx.json(BOBATAN_USER_DATA));
  }),
];
