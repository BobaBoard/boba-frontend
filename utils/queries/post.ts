import {
  CommentData,
  CommentType,
  PostData,
  PostType,
  TagsType,
} from "types/Types";
import { makeClientComment, makeClientPost } from "../client-data";

import axios from "axios";
import debug from "debug";

const log = debug("bobafrontend:queries:post-log");

export const createPost = async (
  replyToPostId: string,
  postData: PostData
): Promise<PostType> => {
  const {
    whisperTags,
    categoryTags,
    indexTags,
    contentWarnings,
    identityId,
    accessoryId,
    ...otherData
  } = postData;
  const response = await axios.post(`/posts/${replyToPostId}/contributions`, {
    ...otherData,
    whisper_tags: whisperTags,
    category_tags: categoryTags,
    index_tags: indexTags,
    content_warnings: contentWarnings,
    identity_id: identityId,
    accessory_id: accessoryId,
  });

  const post = makeClientPost(response.data.contribution);
  log(`Received post from server:`);
  log(post);
  return post;
};

export const editPost = async ({
  postId,
  tags,
}: {
  postId: string;
  tags: TagsType;
}): Promise<PostType> => {
  const response = await axios.patch(`/posts/${postId}/contributions`, {
    whisper_tags: tags.whisperTags,
    category_tags: tags.categoryTags,
    index_tags: tags.indexTags,
    content_warnings: tags.contentWarnings,
  });
  const post = makeClientPost(response.data);
  return post;
};

export const createCommentChain = async ({
  replyToPostId,
  commentData,
}: {
  replyToPostId: string | null;
  commentData: CommentData[];
}): Promise<CommentType[]> => {
  const response = await axios.post(`/posts/${replyToPostId}/comments`, {
    contents: commentData.map((comment) => comment.content),
    forceAnonymous: commentData.some((data) => data.forceAnonymous),
    reply_to_comment_id: commentData[0].replyToCommentId,
    identity_id: commentData[0].identityId,
    accessory_id: commentData[0].accessoryId,
  });
  const comments = response.data.comments.map((comment: any) =>
    makeClientComment(comment, replyToPostId!)
  );
  log(`Received comment from server:`);
  log(comments);
  return comments;
};
