import {
  CommentData,
  CommentType,
  PostData,
  PostType,
  ThreadType,
} from "types/Types";
import {
  makeClientComment,
  makeClientPost,
  makeClientThread,
} from "./client-data";

import axios from "axios";
import debug from "debug";

const log = debug("bobafrontend:queries-log");

export const getThreadData = async ({
  threadId,
}: {
  threadId: string;
}): Promise<ThreadType> => {
  if (!threadId) {
    log(`...can't fetch thread with no id.`);
    // TODO: don't request thread when there's no id.
    throw new Error("Attempted to fetch thread with no id.");
  }
  const response = await axios.get(`threads/${threadId}/`);
  log(`Fetched data for thread with id ${threadId}`);
  return makeClientThread(response.data);
};

export const dismissAllNotifications = async () => {
  await axios.post(`users/notifications/dismiss`);
  return true;
};

export const markThreadAsRead = async ({ threadId }: { threadId: string }) => {
  log(`Marking thread ${threadId} as read.`);
  await axios.get(`threads/${threadId}/visit`);
  return true;
};

export const muteThread = async ({
  threadId,
  mute,
}: {
  threadId: string;
  mute: boolean;
}) => {
  log(`Updating thread ${threadId} muted state.`);
  if (mute) {
    await axios.post(`threads/${threadId}/mute`);
  } else {
    await axios.post(`threads/${threadId}/unmute`);
  }
  return true;
};

export const hideThread = async ({
  threadId,
  hide,
}: {
  threadId: string;
  hide: boolean;
}) => {
  log(`Updating thread ${threadId} hidden state.`);
  if (hide) {
    await axios.post(`threads/${threadId}/hide`);
  } else {
    await axios.post(`threads/${threadId}/unhide`);
  }
  return true;
};

export const createThread = async (
  slug: string,
  postData: PostData
): Promise<ThreadType> => {
  const response = await axios.post(`/threads/${slug}/create`, postData);
  log(`Received thread from server:`);
  log(response.data);
  return makeClientThread(response.data);
};

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

export const getLatestSubscriptionUpdate = async (
  key: string,
  {
    subscriptionId,
  }: {
    subscriptionId: string;
  }
) => {
  const response = await axios.get(`/subscriptions/${subscriptionId}/latest`);
  return response.data[0];
};
