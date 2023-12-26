import { BOBATAN_GORE_FEED } from "./data/feed-board";
import debug from "debug";
import { http, HttpResponse } from "msw";

const log = debug("bobafrontend:tests:server-mocks:feeds");

export default [
  http.get("/feeds/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec", () => {
    log("fetching data for gore feed");
    return HttpResponse.json(BOBATAN_GORE_FEED);
  }),
];
