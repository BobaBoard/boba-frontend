import {
  BOBATAN_BOBADEX,
  BOBATAN_USER_DATA,
  BOBATAN_V0_PINNED_BOARDS,
} from "./data/user";

import debug from "debug";
import { http, HttpResponse } from "msw";
import { server } from ".";
import { V0_DATA } from "./data/realm";

const log = debug("bobafrontend:tests:server-mocks:users");

export default [
  http.get(`/users/@me`, () => {
    log("fetching bobatan's user data");
    return HttpResponse.json(BOBATAN_USER_DATA);
  }),
  http.get(`/users/@me/pins/realms/${V0_DATA.id}`, () => {
    log("fetching bobatan's pinned boards");
    return HttpResponse.json(BOBATAN_V0_PINNED_BOARDS);
  }),
  http.patch<{
    username: string;
    avatarUrl: string;
  }>("/users/@me", async ({ request }) => {
    const body = (await request.json()) as any;
    log("updating user data to:", body);
    if (!body?.username || !body?.avatarUrl) {
      log("invalid request body");
      throw new Error("invalid request");
    }

    // Now return the updated user data when the user data route is called again.
    server.use(
      http.get(`/users/@me`, async ({ request }) => {
        log("fetching updated user data");
        const body = (await request.json()) as any;
        return HttpResponse.json({
          ...BOBATAN_USER_DATA,
          username: body.username,
          avatar_url: body.avatarUrl,
        });
      })
    );
    return HttpResponse.json({
      username: body.username,
      avatar_url: body.avatarUrl,
    });
  }),
  http.get("/users/@me/bobadex", () => {
    log("fetching bobatan's bobadex");
    return HttpResponse.json(BOBATAN_BOBADEX);
  }),
];
