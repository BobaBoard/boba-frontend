import {
  BOARD_URL_PATTERN,
  THREAD_URL_PATTERN,
  createLinkTo,
} from "../../utils/link-utils";

export const FEED_URL = "/users/feed";
const PERSONAL_SETTINGS_URL = "/users/me";

interface LinkWithNotNullAction {
  href: string;
  onClick: () => void;
}

const BOARDS_CACHE = new Map<
  string,
  Map<(() => void) | undefined, LinkWithNotNullAction>
>();
const getLinkToBoard = (
  slug: string,
  onLoad?: () => void
): LinkWithNotNullAction => {
  const memoized = BOARDS_CACHE.get(slug)?.get(onLoad);
  if (memoized) {
    return memoized;
  }
  let slugCache = BOARDS_CACHE.get(slug);
  if (!slugCache) {
    slugCache = new Map<() => void | undefined, LinkWithNotNullAction>();
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
  return slugCache.get(onLoad) as LinkWithNotNullAction;
};

const THREADS_CACHE = new Map<string, LinkWithNotNullAction>();
const getLinkToThread = ({
  slug,
  threadId,
}: {
  slug: string;
  threadId: string;
}) => {
  if (!THREADS_CACHE.has(threadId)) {
    THREADS_CACHE.set(
      threadId,
      createLinkTo({
        urlPattern: THREAD_URL_PATTERN,
        url: `/!${slug}/thread/${threadId}`,
      })
    );
  }

  return THREADS_CACHE.get(threadId) as LinkWithNotNullAction;
};

const POSTS_CACHE = new Map<string, LinkWithNotNullAction>();
const getLinkToPost = ({
  slug,
  threadId,
  postId,
}: {
  slug: string;
  threadId: string;
  postId: string;
}) => {
  if (!POSTS_CACHE.has(postId)) {
    POSTS_CACHE.set(
      postId,
      createLinkTo({
        urlPattern: THREAD_URL_PATTERN,
        url: `/!${slug}/thread/${threadId}/${postId}`,
      })
    );
  }

  return POSTS_CACHE.get(postId) as LinkWithNotNullAction;
};
const linkToHome = createLinkTo({ url: "/" });
const linkToFeed = createLinkTo({ url: FEED_URL });
const linkToLogs = createLinkTo({
  urlPattern: THREAD_URL_PATTERN,
  url: process.env.NEXT_PUBLIC_RELEASE_THREAD_URL || "",
});
const linkToPersonalSettings = createLinkTo({ url: PERSONAL_SETTINGS_URL });
// TODO: this is not really a hook so it should be somewhere else with a different name.
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
