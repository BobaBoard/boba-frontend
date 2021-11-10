import { PostType, TagsType, ThreadType } from "types/Types";

import axios from "axios";
import { makeClientPost } from "../client-data";

export const editPost = async ({
  postId,
  tags,
}: {
  postId: string;
  tags: TagsType;
}): Promise<PostType> => {
  const response = await axios.patch(`/posts/${postId}/contribution`, {
    whisper_tags: tags.whisperTags,
    category_tags: tags.categoryTags,
    index_tags: tags.indexTags,
    content_warnings: tags.contentWarnings,
  });
  const post = makeClientPost(response.data?.contribution);
  return post;
};

export const updateThreadView = async ({
  threadId,
  view,
}: {
  threadId: string;
  view: ThreadType["defaultView"];
}) => {
  await axios.post(`/threads/${threadId}/update/view`, {
    defaultView: view,
  });
};
