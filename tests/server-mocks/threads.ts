import { GORE_FEED } from "./data/feed-board";
import { NEW_THREAD_BASE } from "./data/thread";
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
];
