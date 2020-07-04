import axios from "axios";
import debug from "debug";
import { PostType, BoardActivityResponse } from "../types/PostTypes";

const log = debug("bobafrontend:queries-log");
const info = debug("bobafrontend:queries-info");

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
    activity: response.data.activity.map(
      (post: any): PostType => ({
        postId: post.post_id,
        threadId: post.thread_id,
        secretIdentity: {
          name: post.secret_identity.name,
          avatar: post.secret_identity.avatar,
        },
        userIdentity: post.user_identity && {
          name: post.user_identity.name,
          avatar: post.user_identity.avatar,
        },
        created: post.created,
        content: post.content,
        options: {
          wide: post.options?.wide,
        },
        whisperTags: post.whisper_tags,
        postsAmount: post.posts_amount,
        threadsAmount: post.threads_amount,
        newPostsAmount: post.new_posts_amunt,
        newCommentsAmount: post.new_comments_amount,
        isNew: post.is_new,
        lastActivity: post.last_activity,
        commentsAmount: post.comments_amount,
      })
    ),
  };
};

export const getThreadData = async (
  key: string,
  { threadId }: { threadId: string }
) => {
  if (!threadId) {
    return;
  }
  const response = await axios.get(`threads/${threadId}/`);
  return response.data;
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
