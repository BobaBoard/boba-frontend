import {
  BOBATAN_NOTIFICATIONS_DATA,
  BOBATAN_V0_PINNED_BOARDS,
} from "./data/user";

import { BOBATAN_GORE_METADATA } from "./data/board-metadata";
import { GORE_FEED } from "./data/feed-board";
import { NEW_THREAD_BASE } from "./data/thread";
import { V0_DATA } from "./data/realm";
import debug from "debug";
import { http, HttpResponse } from "msw";
import { server } from ".";

const log = debug("bobafrontend:tests:server-mocks:boards");

export default [
  http.get("/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec", () => {
    log("fetching data for gore board");
    return HttpResponse.json(BOBATAN_GORE_METADATA);
  }),
  http.post(
    "http://localhost:4200/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/visits",
    () => {
      log("marking gore board as visited");
      return new HttpResponse(null, { status: 204 });
    }
  ),
  http.post("/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/mute", () => {
    log("marking gore board as muted");

    server.use(
      http.get("/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec", () => {
        log("fetching data for gore board (muted)");
        return HttpResponse.json({ ...BOBATAN_GORE_METADATA, muted: true });
      })
    );

    return new HttpResponse(null, { status: 204 });
  }),
  http.post(
    "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec",
    async ({ request }) => {
      log("creating text on gore board");

      const {
        content,
        defaultView,
        whisperTags,
        indexTags,
        contentWarnings,
        categoryTags,
        identityId,
      } = (await request.json()) as any;
      const starter = {
        ...NEW_THREAD_BASE.starter,
        content,
        tags: {
          whisper_tags: whisperTags || [],
          index_tags: indexTags || [],
          content_warnings: contentWarnings || [],
          category_tags: categoryTags || [],
        },
        secret_identity: {
          name:
            BOBATAN_GORE_METADATA.posting_identities.find(
              (id) => id.id === identityId
            )?.name || NEW_THREAD_BASE.starter.secret_identity.name,
          color:
            BOBATAN_GORE_METADATA.posting_identities.find(
              (id) => id.id === identityId
            )?.color || NEW_THREAD_BASE.starter.secret_identity.color,
          accessory:
            BOBATAN_GORE_METADATA.posting_identities.find(
              (id) => id.id === identityId
            )?.accessory || NEW_THREAD_BASE.starter.secret_identity.accessory,
          avatar:
            BOBATAN_GORE_METADATA.posting_identities.find(
              (id) => id.id === identityId
            )?.avatar_url || NEW_THREAD_BASE.starter.secret_identity.avatar,
        },
      };

      const newThread = {
        ...NEW_THREAD_BASE,
        starter,
        default_view: defaultView,
        posts: [starter],
        comments: {
          [starter.id]: [],
        },
      };

      // Now return the created post when the board feed is called again.
      server.use(
        http.get(
          "/feeds/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          () => {
            log("fetching data for gore feed with new post");
            const newFeed = {
              ...GORE_FEED,
              activity: [newThread, ...GORE_FEED.activity],
            };
            return HttpResponse.json(newFeed);
          },
          { once: true }
        )
      );
      return HttpResponse.json(newThread);
    }
  ),
  http.delete("/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/pin", () => {
    log("unpinning gore board");

    server.use(
      http.get("/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec", () => {
        log("fetching data for gore board (muted)");
        return HttpResponse.json({ ...BOBATAN_GORE_METADATA, pinned: false });
      }),
      http.get(`/users/@me/pins/realms/${V0_DATA.id}`, () => {
        log("fetching bobatan's pinned boards (gore unpinned)");
        const { gore, ...otherPinnedBoards } =
          BOBATAN_V0_PINNED_BOARDS.pinned_boards;
        return HttpResponse.json({
          pinned_boards: otherPinnedBoards,
        });
      })
    );

    return new HttpResponse(null, { status: 204 });
  }),
  http.delete(
    "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/notifications",
    () => {
      log("removing notifications from board gore");

      server.use(
        http.get(
          `/realms/${BOBATAN_GORE_METADATA.realm_id}/notifications`,
          () => {
            log("fetching bobatan's notification data (gore update dismissed)");
            BOBATAN_NOTIFICATIONS_DATA;
            return HttpResponse.json({
              ...BOBATAN_NOTIFICATIONS_DATA,
              pinned_boards: {
                ...BOBATAN_NOTIFICATIONS_DATA.pinned_boards,
                [BOBATAN_GORE_METADATA.id]: {
                  ...BOBATAN_NOTIFICATIONS_DATA.pinned_boards[
                    BOBATAN_GORE_METADATA.id
                  ],
                  has_updates: false,
                },
              },
              realm_boards: {
                ...BOBATAN_NOTIFICATIONS_DATA.realm_boards,
                [BOBATAN_GORE_METADATA.id]: {
                  ...BOBATAN_NOTIFICATIONS_DATA.realm_boards[
                    BOBATAN_GORE_METADATA.id
                  ],
                  has_updates: false,
                },
              },
            });
          }
        )
      );

      return new HttpResponse(null, { status: 204 });
    }
  ),
];
