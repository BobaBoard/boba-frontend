import {
  FAVORITE_CHARACTER_TO_MAIM_THREAD,
  NEW_THREAD_BASE,
} from "./data/thread";

import { BOBATAN_GORE_METADATA } from "./data/board-metadata";
import { GORE_FEED } from "./data/feed-board";
import { rest } from "msw";
import { server } from ".";

export default [
  rest.post("/threads/gore/create", (req, res, ctx) => {
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
  // TODO: remove the trailing /
  rest.get(
    "/threads/29d1b2da-3289-454a-9089-2ed47db4967b/",
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(FAVORITE_CHARACTER_TO_MAIM_THREAD));
    }
  ),
  rest.get(
    "/threads/29d1b2da-3289-454a-9089-2ed47db4967b/visit",
    (req, res, ctx) => {
      return res(ctx.status(200));
    }
  ),
];
