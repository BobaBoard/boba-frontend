import {
  BOARD_PATH,
  FEED_PATH,
  PERSONAL_SETTINGS_PATH,
  REALM_ADMIN_PATH,
  THREAD_PATH,
  createLinkTo,
} from "utils/router-utils";

import { PostData } from "types/Types";
import { ThreadViewQueryParams } from "../thread/ThreadViewContext";
import { encodeQueryParams } from "use-query-params";
import { isSandbox } from "utils/location-utils";
import { stringify } from "query-string";

interface LinkWithNotNullAction {
  href: string;
  onClick: () => void;
}

const BOARDS_CACHE = new Map<
  string,
  Map<((slug: string) => void) | undefined, LinkWithNotNullAction>
>();
const getLinkToBoard = (
  slug: string,
  onLoad?: (slug: string) => void
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
      onLoad: onLoad ? () => onLoad(slug) : undefined,
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
const linkToRealmAdmin = createLinkTo({ url: REALM_ADMIN_PATH });
const SANDBOXED_LINKS = {
  linkToHome: linkToCurrent,
  linkToFeed: linkToCurrent,
  linkToLogs: linkToCurrent,
  linkToPersonalSettings: linkToCurrent,
  linkToRealmAdmin: linkToCurrent,
  linkToCurrent,
  getLinkToBoard: (
    slug: string,
    onLoad?: ((slug: string) => void) | undefined
  ) => linkToCurrent,
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
  linkToRealmAdmin,
  linkToCurrent,
  getLinkToBoard,
  getLinkToThread,
  getLinkToPost,
};
// TODO: rename this because it's not a hook and can be used outside of a
// component context.
export const useCachedLinks = () => {
  if (isSandbox(undefined)) {
    return SANDBOXED_LINKS;
  }
  return REGULAR_LINKS;
};
