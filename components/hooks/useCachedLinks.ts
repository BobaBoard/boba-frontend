import { ThreadViewQueryParams } from "../thread/ThreadViewContext";
import { stringify } from "query-string";
import { PostData } from "types/Types";
import { encodeQueryParams } from "use-query-params";
import {
  BOARD_PATH,
  createLinkTo,
  FEED_PATH,
  PERSONAL_SETTINGS_PATH,
  THREAD_PATH,
} from "utils/router-utils";
import { isSandbox } from "utils/server-utils";

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
      urlPattern: BOARD_PATH,
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
  view,
}: {
  slug: string;
  threadId: string;
  view?: PostData["defaultView"];
}) => {
  const id = view ? `${threadId}_${view}` : threadId;
  if (!THREADS_CACHE.has(id)) {
    THREADS_CACHE.set(
      id,
      createLinkTo({
        urlPattern: THREAD_PATH,
        url: view
          ? `/!${slug}/thread/${threadId}?${stringify(
              encodeQueryParams(ThreadViewQueryParams, { [view]: true })
            )}`
          : `/!${slug}/thread/${threadId}`,
        queryParams: view && {
          [view]: true,
        },
      })
    );
  }

  return THREADS_CACHE.get(id) as LinkWithNotNullAction;
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
        urlPattern: THREAD_PATH,
        url: `/!${slug}/thread/${threadId}/${postId}`,
      })
    );
  }

  return POSTS_CACHE.get(postId) as LinkWithNotNullAction;
};
const linkToHome = createLinkTo({ url: "/" });
const linkToCurrent = createLinkTo({
  url: typeof window === "undefined" ? "" : location.pathname,
});
const linkToFeed = createLinkTo({ url: FEED_PATH });
const linkToLogs = createLinkTo({
  urlPattern: THREAD_PATH,
  url: process.env.NEXT_PUBLIC_RELEASE_THREAD_URL || "",
});
const linkToPersonalSettings = createLinkTo({ url: PERSONAL_SETTINGS_PATH });
// TODO: rename this because it's not a hook and can be used outside of a
// component context.

const SANDBOXED_LINKS = {
  linkToHome: linkToCurrent,
  linkToFeed: linkToCurrent,
  linkToLogs: linkToCurrent,
  linkToPersonalSettings: linkToCurrent,
  linkToCurrent,
  getLinkToBoard: (slug: string, onLoad?: (() => void) | undefined) =>
    linkToCurrent,
  getLinkToThread: ({
    slug,
    threadId,
    view,
  }: {
    slug: string;
    threadId: string;
    view?: "thread" | "gallery" | "timeline" | undefined;
  }) => linkToCurrent,
  getLinkToPost,
};

const REGULAR_LINKS = {
  linkToHome,
  linkToFeed,
  linkToLogs,
  linkToPersonalSettings,
  linkToCurrent,
  getLinkToBoard,
  getLinkToThread,
  getLinkToPost,
};
export const useCachedLinks = () => {
  if (isSandbox(undefined)) {
    return SANDBOXED_LINKS;
  }
  return REGULAR_LINKS;
};
