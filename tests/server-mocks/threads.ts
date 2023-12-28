import {
  FAVORITE_CHARACTER_TO_MAIM_THREAD,
  FAVORITE_MURDER_SCENE_BOBATAN,
} from "./data/thread";

import { http, HttpResponse } from "msw";
import { server } from ".";

export default [
  // TODO: remove the trailing /
  http.get("/threads/29d1b2da-3289-454a-9089-2ed47db4967b/", () => {
    return HttpResponse.json(FAVORITE_CHARACTER_TO_MAIM_THREAD);
  }),
  http.get(`/threads/${FAVORITE_MURDER_SCENE_BOBATAN.id}/`, () => {
    return HttpResponse.json(FAVORITE_MURDER_SCENE_BOBATAN);
  }),
  http.post("/threads/29d1b2da-3289-454a-9089-2ed47db4967b/visits", () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.post("/threads/29d1b2da-3289-454a-9089-2ed47db4967b/mute", () => {
    // Now return the thread as muted when the thread endpoints are called again
    server.use(
      http.get("/threads/29d1b2da-3289-454a-9089-2ed47db4967b/", () => {
        return HttpResponse.json({
          ...FAVORITE_CHARACTER_TO_MAIM_THREAD,
          muted: true,
        });
      })
    );

    return new HttpResponse(null, { status: 204 });
  }),
  http.delete("/threads/29d1b2da-3289-454a-9089-2ed47db4967b/mute", () => {
    // Now return the thread as muted when the thread endpoints are called again
    server.use(
      http.get("/threads/29d1b2da-3289-454a-9089-2ed47db4967b/", () => {
        return HttpResponse.json({
          ...FAVORITE_CHARACTER_TO_MAIM_THREAD,
          muted: false,
        });
      })
    );

    return new HttpResponse(null, { status: 204 });
  }),
  http.post("/threads/29d1b2da-3289-454a-9089-2ed47db4967b/hide", () => {
    // Now return the thread as muted when the thread endpoints are called again
    server.use(
      http.get("/threads/29d1b2da-3289-454a-9089-2ed47db4967b/", () => {
        return HttpResponse.json({
          ...FAVORITE_CHARACTER_TO_MAIM_THREAD,
          hidden: true,
        });
      })
    );

    return new HttpResponse(null, { status: 204 });
  }),
  http.delete("/threads/29d1b2da-3289-454a-9089-2ed47db4967b/hide", () => {
    // Now return the thread as muted when the thread endpoints are called again
    server.use(
      http.get("/threads/29d1b2da-3289-454a-9089-2ed47db4967b/", () => {
        return HttpResponse.json({
          ...FAVORITE_CHARACTER_TO_MAIM_THREAD,
          hidden: false,
        });
      })
    );

    return new HttpResponse(null, { status: 204 });
  }),
];
