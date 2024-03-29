import {
  BOBATAN_NOTIFICATIONS_DATA,
  BOBATAN_V0_PINNED_BOARDS,
} from "./data/user";

import { BOBATAN_GORE_METADATA } from "./data/board-metadata";
import { GORE_FEED } from "./data/feed-board";
import { NEW_THREAD_BASE } from "./data/thread";
import { V0_DATA } from "./data/realm";
import debug from "debug";
import { rest } from "msw";
import { server } from ".";

const log = debug("bobafrontend:tests:server-mocks:boards");

export default [
  rest.get("/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec", (req, res, ctx) => {
    log("fetching data for gore board");
    return res(ctx.status(200), ctx.json(BOBATAN_GORE_METADATA));
  }),
  rest.post(
    "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/visits",
    (req, res, ctx) => {
      log("marking gore board as visited");
      return res(ctx.status(204));
    }
  ),
  rest.post(
    "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/mute",
    (req, res, ctx) => {
      log("marking gore board as muted");

      server.use(
        rest.get(
          "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          (req, res, ctx) => {
            log("fetching data for gore board (muted)");
            return res(
              ctx.status(200),
              ctx.json({ ...BOBATAN_GORE_METADATA, muted: true })
            );
          }
        )
      );
      return res(ctx.status(204));
    }
  ),
  rest.post("/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec", (req, res, ctx) => {
    log("creating text on gore board");

    const {
      content,
      defaultView,
      whisperTags,
      indexTags,
      contentWarnings,
      categoryTags,
      identityId,
    } = req!.body! as any;
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
      rest.get(
        "/feeds/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec",
        (req, res, ctx) => {
          log("fetching data for gore feed with new post");
          const newFeed = {
            ...GORE_FEED,
            activity: [newThread, ...GORE_FEED.activity],
          };
          return res.once(ctx.status(200), ctx.json(newFeed));
        }
      )
    );
    return res(ctx.status(200), ctx.json(newThread));
  }),
  rest.delete(
    "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/pin",
    (req, res, ctx) => {
      log("unpinning gore board");

      server.use(
        rest.get(
          "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          (req, res, ctx) => {
            log("fetching data for gore board (muted)");
            return res(
              ctx.status(200),
              ctx.json({ ...BOBATAN_GORE_METADATA, pinned: false })
            );
          }
        ),
        rest.get(`/users/@me/pins/realms/${V0_DATA.id}`, (req, res, ctx) => {
          log("fetching bobatan's pinned boards (gore unpinned)");
          const { gore, ...otherBoards } =
            BOBATAN_V0_PINNED_BOARDS.pinned_boards;
          return res(
            ctx.status(200),
            ctx.json({
              pinned_boards: otherBoards,
            })
          );
        })
      );

      return res(ctx.status(204));
    }
  ),
  rest.delete(
    "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/notifications",
    (req, res, ctx) => {
      log("removing notifications from board gore");

      server.use(
        rest.get(
          `/realms/${BOBATAN_GORE_METADATA.realm_id}/notifications`,
          (req, res, ctx) => {
            log("fetching bobatan's notification data (gore update dismissed)");
            BOBATAN_NOTIFICATIONS_DATA;
            return res(
              ctx.status(200),
              ctx.json({
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
              })
            );
          }
        )
      );
      return res(ctx.status(204));
    }
  ),
];
