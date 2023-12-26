import {
  FAVORITE_CHARACTER_TO_MAIM_THREAD,
  FAVORITE_MURDER_SCENE_BOBATAN,
} from "./data/thread";

import { NEW_COMMENT_BASE } from "./data/comments";
import { NEW_POST_BASE } from "./data/posts";
import { http, HttpResponse } from "msw";
import { v4 as uuid } from "uuid";

export default [
  http.post(
    `/posts/${FAVORITE_CHARACTER_TO_MAIM_THREAD.starter.id}/contributions`,
    async ({ request }) => {
      const {
        content,
        whisper_tags,
        index_tags,
        content_warnings,
        category_tags,
      } = (await request.json()) as any;

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
      return HttpResponse.json({ contribution: newPost });
    }
  ),

  http.post(
    `/posts/${FAVORITE_CHARACTER_TO_MAIM_THREAD.starter.id}/comments`,
    async ({ request }) => {
      const { contents, reply_to_comment_id } = (await request.json()) as any;
      const chainId = uuid();

      const comments = contents.map((content: string, index: number) => ({
        ...NEW_COMMENT_BASE,
        id: index == 0 ? chainId : uuid(),
        parent_comment_id: reply_to_comment_id,
        chain_parent_id: index > 0 ? chainId : undefined,
        parent_thread_id: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
        parent_post_id: FAVORITE_CHARACTER_TO_MAIM_THREAD.starter.id,
        content: content,
      }));

      return HttpResponse.json({ comments: comments });
    }
  ),

  http.patch(
    `/posts/3db477e0-57ed-491d-ba11-b3a0110b59b0/contributions`,
    async ({ request }) => {
      const { whisper_tags, index_tags, content_warnings, category_tags } =
        (await request.json()) as any;

      const newPost = {
        ...FAVORITE_MURDER_SCENE_BOBATAN.starter,
        tags: {
          whisper_tags,
          index_tags,
          content_warnings,
          category_tags,
        },
      };

      return HttpResponse.json(newPost);
    }
  ),
];
