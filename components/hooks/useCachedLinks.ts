import { LinkWithAction } from "@bobaboard/ui-components/dist/types";
import {
  BOARD_URL_PATTERN,
  THREAD_URL_PATTERN,
  createLinkTo,
} from "../../utils/link-utils";

export const FEED_URL = "/users/feed";
const LOGS_URL = "/update-logs";
const PERSONAL_SETTINGS_URL = "/users/me";

const BOARDS_CACHE = new Map<
  string,
  Map<(() => void) | undefined, LinkWithAction>
>();
const getLinkToBoard = (slug: string, onLoad?: () => void) => {
  const memoized = BOARDS_CACHE.get(slug)?.get(onLoad);
  if (memoized) {
    return memoized;
  }
  let slugCache = BOARDS_CACHE.get(slug);
  if (!slugCache) {
    slugCache = new Map<() => void | undefined, LinkWithAction>();
    BOARDS_CACHE.set(slug, slugCache);
  }
  slugCache.set(
    onLoad,
    createLinkTo({
      urlPattern: BOARD_URL_PATTERN,
      url: `/!${slug.replace(" ", "_")}`,
      onLoad,
    })
  );
  return slugCache.get(onLoad) as LinkWithAction;
};

const THREADS_CACHE = new Map<string, LinkWithAction>();
const getLinkToThread = ({
  slug,
  threadId,
}: {
  slug: string;
  threadId: string;
}) => {
  if (THREADS_CACHE.has(threadId)) {
    return THREADS_CACHE.get(threadId);
  }
  THREADS_CACHE.set(
    threadId,
    createLinkTo({
      urlPattern: THREAD_URL_PATTERN,
      url: `/!${slug}/thread/${threadId}`,
    })
  );

  return THREADS_CACHE.get(threadId);
};

const POSTS_CACHE = new Map<string, LinkWithAction>();
const getLinkToPost = ({
  slug,
  threadId,
  postId,
}: {
  slug: string;
  threadId: string;
  postId: string;
}) => {
  if (POSTS_CACHE.has(postId)) {
    return POSTS_CACHE.get(postId);
  }
  POSTS_CACHE.set(
    postId,
    createLinkTo({
      urlPattern: THREAD_URL_PATTERN,
      url: `/!${slug}/thread/${threadId}/${postId}`,
    })
  );

  return POSTS_CACHE.get(postId);
};
const linkToHome = createLinkTo({ url: "/" });
const linkToFeed = createLinkTo({ url: FEED_URL });
const linkToLogs = createLinkTo({ url: LOGS_URL });
const linkToPersonalSettings = createLinkTo({ url: PERSONAL_SETTINGS_URL });
export const useCachedLinks = () => {
  return {
    linkToHome,
    linkToFeed,
    linkToLogs,
    linkToPersonalSettings,
    getLinkToBoard,
    getLinkToThread,
    getLinkToPost,
  };
};

export default {
  linkToHome,
  linkToFeed,
  linkToLogs,
  linkToPersonalSettings,
  getLinkToBoard,
  getLinkToThread,
  getLinkToPost,
};
