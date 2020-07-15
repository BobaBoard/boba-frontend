import axios from "axios";
import debug from "debug";
import {
  PostType,
  BoardActivityResponse,
  CommentType,
  CommentData,
  PostData,
  ThreadType,
} from "../types/Types";

const log = debug("bobafrontend:queries-log");
const info = debug("bobafrontend:queries-info");

const makeClientComment = (serverComment: any): CommentType => ({
  commentId: serverComment.comment_id,
  secretIdentity: {
    name: serverComment.secret_identity.name,
    avatar: serverComment.secret_identity.avatar,
  },
  userIdentity: serverComment.user_identity && {
    name: serverComment.user_identity.name,
    avatar: serverComment.user_identity.avatar,
  },
  created: serverComment.created,
  content: serverComment.content,
  isNew: serverComment.is_new,
});

const makeClientPost = (serverPost: any): PostType => ({
  postId: serverPost.post_id,
  threadId: serverPost.thread_id,
  parentPostId: serverPost.parent_post_id,
  secretIdentity: {
    name: serverPost.secret_identity.name,
    avatar: serverPost.secret_identity.avatar,
  },
  userIdentity: serverPost.user_identity && {
    name: serverPost.user_identity.name,
    avatar: serverPost.user_identity.avatar,
  },
  created: serverPost.created,
  content: serverPost.content,
  options: {
    wide: serverPost.options?.wide,
  },
  tags: {
    whisperTags: serverPost.tags.whisper_tags,
  },
  comments: serverPost.comments?.map(makeClientComment),
  postsAmount: serverPost.posts_amount,
  threadsAmount: serverPost.threads_amount,
  newPostsAmount: serverPost.new_posts_amount,
  newCommentsAmount: serverPost.new_comments_amount,
  isNew: serverPost.is_new,
  commentsAmount: serverPost.comments_amount,
});

const makeClientThread = (serverThread: any): ThreadType => ({
  posts: serverThread.posts.map(makeClientPost),
  isNew: serverThread.posts[0].is_new,
  threadId: serverThread.thread_id,
  newPostsAmount: serverThread.thread_new_posts_amount,
  newCommentsAmount: serverThread.thread_new_comments_amount,
  totalCommentsAmount: serverThread.thread_total_comments_amount,
  totalPostsAmount: serverThread.thread_total_posts_amount,
  lastActivity: serverThread.thread_last_activity,
});

export const getBoardData = async (key: string, { slug }: { slug: string }) => {
  log(`Fetching board data for board with slug ${slug}.`);
  if (!slug) {
    log(`...can't fetch board data for board with no slug.`);
    return;
  }
  const response = await axios.get(`boards/${slug}`);
  log(`Got response for board data with slug ${slug}.`);
  info(response.data);
  return response.data;
};

export const getBoardActivityData = async (
  key: string,
  { slug }: { slug: string },
  cursor?: string
): Promise<BoardActivityResponse | undefined> => {
  log(`Fetching board activity for board with slug ${slug}.`);
  if (!slug) {
    log(`...can't fetch board activity for board with no slug.`);
    // TODO: don't request activity when there's no slug.
    throw new Error("Attempted to fetch board activity with no slug");
  }
  const response = await axios.get(`boards/${slug}/activity/latest`, {
    params: { cursor },
  });
  log(
    `Got response for board activity with slug ${slug}. Status: ${response.status}`
  );
  if (response.status == 204) {
    // No data, let's return empty array
    return { nextPageCursor: undefined, activity: [] };
  }
  // Transform post to client-side type.
  return {
    nextPageCursor: response.data.next_page_cursor,
    activity: response.data.activity.map(makeClientThread),
  };
};

export const getThreadData = async (
  key: string,
  { threadId }: { threadId: string }
): Promise<ThreadType> => {
  if (!threadId) {
    log(`...can't fetch thread with no id.`);
    // TODO: don't request thread when there's no id.
    throw new Error("Attempted to fetch thread with no id.");
  }
  const response = await axios.get(`threads/${threadId}/`);
  log(`Fetched data for thread with id ${threadId}`);
  return makeClientThread(response.data);
};

export const ALL_BOARDS_KEY = "allBoardsData";
export const getAllBoardsData = async (key: string) => {
  log(`Fetching all boards data.`);
  const response = await axios.get(`boards`);
  log(`Got response for all boards data.`);
  info(response.data);

  try {
    // Save response to localstorage to speed up loading
    localStorage.setItem("allBoardsData", JSON.stringify(response.data));
  } catch (e) {
    log("Error while saving boards to local storage.");
  }

  return response.data;
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
  const response = await axios.post(
    `/posts/${replyToPostId}/contribute`,
    postData
  );
  const post = makeClientPost(response.data.contribution);
  log(`Received post from server:`);
  log(post);
  return post;
};

export const createComment = async ({
  replyToPostId,
  commentData,
}: {
  replyToPostId: string | null;
  commentData: CommentData;
}): Promise<CommentType> => {
  const response = await axios.post(
    `/posts/${replyToPostId}/comment`,
    commentData
  );
  const comment = makeClientComment(response.data.comment);
  log(`Received comment from server:`);
  log(comment);
  return comment;
};
