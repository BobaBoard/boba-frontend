import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "./data/thread";
import { NEW_POST_BASE } from "./data/posts";
import { rest } from "msw";

export default [
  rest.post(
    `/posts/${FAVORITE_CHARACTER_TO_MAIM_THREAD.starter.id}/contributions`,
    (req, res, ctx) => {
      const {
        content,
        whisper_tags,
        index_tags,
        content_warnings,
        category_tags,
      } = req!.body! as any;

      const newPost = {
        ...NEW_POST_BASE,
        parent_thread_id: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
        parent_post_id: FAVORITE_CHARACTER_TO_MAIM_THREAD.starter.id,
        content,
        tags: {
          whisper_tags: whisper_tags || [],
          index_tags: index_tags || [],
          content_warnings: content_warnings || [],
          category_tags: category_tags || [],
        },
      };
      return res(ctx.status(200), ctx.json({ contribution: newPost }));
    }
  ),
];
