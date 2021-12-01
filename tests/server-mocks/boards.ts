import { BOBATAN_NOTIFICATIONS_DATA, BOBATAN_USER_DATA } from "./data/user";

import { BOBATAN_GORE_METADATA } from "./data/board-metadata";
import { GORE_FEED } from "./data/feed-board";
import { NEW_THREAD_BASE } from "./data/thread";
import { rest } from "msw";
import { server } from ".";

export default [
  rest.get("/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec", (req, res, ctx) => {
    console.log("fetching data for gore board");
    return res(ctx.status(200), ctx.json(BOBATAN_GORE_METADATA));
  }),
  rest.post(
    "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/visits",
    (req, res, ctx) => {
      console.log("marking gore board as visited");
      return res(ctx.status(204));
    }
  ),
  rest.post(
    "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/mute",
    (req, res, ctx) => {
      console.log("marking gore board as muted");

      server.use(
        rest.get(
          "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          (req, res, ctx) => {
            console.log("fetching data for gore board (muted)");
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
    console.log("creating text on gore board");

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
          console.log("fetching data for gore feed with new post");
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
      console.log("unpinning gore board");

      server.use(
        rest.get(
          "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          (req, res, ctx) => {
            console.log("fetching data for gore board (muted)");
            return res(
              ctx.status(200),
              ctx.json({ ...BOBATAN_GORE_METADATA, pinned: false })
            );
          }
        ),
        rest.get("/users/@me", (req, res, ctx) => {
          console.log("fetching bobatan's user data (gore unpinned)");
          const { gore, ...otherBoards } = BOBATAN_USER_DATA.pinned_boards;
          return res(
            ctx.status(200),
            ctx.json({
              ...BOBATAN_USER_DATA,
              pinned_boards: otherBoards,
            })
          );
        })
      );

      return res(ctx.status(204));
    }
  ),
  rest.post(
    "/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec/notifications/dismiss",
    (req, res, ctx) => {
      console.log("removing notifications from board gore");

      server.use(
        rest.get("/users/@me/notifications", (req, res, ctx) => {
          console.log(
            "fetching bobatan's notification data (gore update dismissed)"
          );
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
        })
      );
      return res(ctx.status(204));
    }
  ),
];
