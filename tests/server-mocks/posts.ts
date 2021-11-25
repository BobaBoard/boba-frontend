import {
  FAVORITE_CHARACTER_TO_MAIM_THREAD,
  FAVORITE_MURDER_SCENE_BOBATAN,
} from "./data/thread";

import { NEW_COMMENT_BASE } from "./data/comments";
import { NEW_POST_BASE } from "./data/posts";
import { rest } from "msw";
import { v4 as uuid } from "uuid";

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

  rest.post(
    `/posts/${FAVORITE_CHARACTER_TO_MAIM_THREAD.starter.id}/comments`,
    (req, res, ctx) => {
      const { contents, reply_to_comment_id } = req!.body! as any;

      const chainId = uuid();
      const comments = contents.map((content: string, index: number) => ({
        ...NEW_COMMENT_BASE,
        id: index == 0 ? chainId : uuid(),
        parent_comment_id: reply_to_comment_id,
        chain_parent_id: index > 0 ? chainId : undefined,
        parent_post_id: FAVORITE_CHARACTER_TO_MAIM_THREAD.starter.id,
        content: content,
      }));

      return res(ctx.status(200), ctx.json({ comments: comments }));
    }
  ),

  rest.patch(
    `/posts/3db477e0-57ed-491d-ba11-b3a0110b59b0/contributions`,
    (req, res, ctx) => {
      const { whisper_tags, index_tags, content_warnings, category_tags } = req!
        .body! as any;

      const newPost = {
        ...FAVORITE_MURDER_SCENE_BOBATAN.starter,
        tags: {
          whisper_tags,
          index_tags,
          content_warnings,
          category_tags,
        },
      };

      return res(ctx.status(200), ctx.json(newPost));
    }
  ),
];
