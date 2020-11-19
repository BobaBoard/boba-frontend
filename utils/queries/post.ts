import axios from "axios";
import { PostType, ThreadType, TagsType } from "../../types/Types";
import { makeClientPost } from "../server-utils";

export const editPost = async ({
  postId,
  tags,
}: {
  postId: string;
  tags: TagsType;
}): Promise<PostType> => {
  const response = await axios.post(`/posts/${postId}/edit`, tags);
  const post = makeClientPost(response.data);
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
