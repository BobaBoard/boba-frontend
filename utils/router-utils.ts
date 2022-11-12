import Router, { NextRouter } from "next/router";

import React from "react";
import debug from "debug";
import { getCurrentRealmSlug } from "./location-utils";

const log = debug("bobafrontend:router-utils-log");

interface PageDetails {
  realmSlug: string | null;
  slug: string | null;
  threadId: string | null;
  postId: string | null;
  commentId: string | null;
  threadBaseUrl: string | null;
  pageType: PageTypes | null;
}

/**
 * The information present in the URL of either a
 * thread, a post, or a comment page.
 */
export interface ThreadPageDetails {
  realmSlug: string;
  slug: string;
  threadId: string;
  postId: string | null;
  commentId: string | null;
  threadBaseUrl: string;
  pageType: PageTypes.THREAD | PageTypes.POST | PageTypes.COMMENT;
}

export interface BoardPageDetails {
  realmSlug: string;
  slug: string;
  threadId: null;
  postId: null;
  threadBaseUrl: null;
  pageType: PageTypes.BOARD;
}

let isInitialized = false;
let dispatchPending = false;
let currentPageData: PageDetails = {
  realmSlug: null,
  slug: null,
  threadId: null,
  postId: null,
  commentId: null,
  threadBaseUrl: null,
  pageType: null,
};
let listeners: React.Dispatch<React.SetStateAction<PageDetails>>[] = [];

export enum PageTypes {
  HOME = "HOME",
  BOARD = "BOARD",
  THREAD = "THREAD",
  POST = "POST",
  COMMENT = "COMMENT",
  FEED = "FEED",
  SETTINGS = "SETTINGS",
  ADMIN = "ADMIN",
  INVITE = "INVITE",
}

export const BOARD_PATH = "/[boardId]";
export const THREAD_PATH = "/[boardId]/thread/[...threadId]";
export const POST_PATH = "/[boardId]/thread/[...threadId]";
export const COMMENT_PATH = "/[boardId]/thread/[...threadId]";
export const FEED_PATH = "/users/feed";
export const PERSONAL_SETTINGS_PATH = "/users/settings";
export const REALM_ADMIN_PATH = "/realms/admin";
export const INVITE_PAGE_PATH = "/invite/[inviteId]";

/**
 * Returns the details of the page you're currently in as specified
 * in the page URL.
 */
// TODO: rename to usePageUrlDetails.
export const usePageDetails = <T extends PageDetails>() => {
  if (!isInitialized) {
    throw new Error(
      "usePageDetails can only be called after being initialized with a router object."
    );
  }
  const [pageData, pageDataChangeListener] = React.useState<T>(
    currentPageData as T
  );

  React.useEffect(() => {
    listeners.push(pageDataChangeListener);
    return () => {
      listeners = listeners.filter(
        (listener) => listener !== pageDataChangeListener
      );
    };
  }, []);

  return pageData;
};

const getPageType = (router: NextRouter): PageTypes | null => {
  switch (router.pathname) {
    case BOARD_PATH:
      return PageTypes.BOARD;
    // This is the same url as for single posts
    case THREAD_PATH: {
      const secondThreadUrlSegment = router.query.threadId?.[1];
      if (secondThreadUrlSegment === "comment") {
        return PageTypes.COMMENT;
      }
      // If the `secondThreadUrlSegment` is not the string "comment" then
      // it's a postId.
      return secondThreadUrlSegment ? PageTypes.POST : PageTypes.THREAD;
    }
    case FEED_PATH:
      return PageTypes.FEED;
    case PERSONAL_SETTINGS_PATH:
      return PageTypes.SETTINGS;
    case REALM_ADMIN_PATH:
      return PageTypes.ADMIN;
    case INVITE_PAGE_PATH:
      return PageTypes.INVITE;
    default:
      return null;
  }
};

export const getPageDetails = <T extends PageDetails>(router: NextRouter) => {
  const slug = (router.query.boardId as string)?.substring(1) || null;
  const threadId = (router.query.threadId?.[0] as string) || null;
  const commentId =
    router.query.threadId?.[1] === "comment"
      ? router.query.threadId?.[2]
      : null;
  const postId = commentId === null ? router.query.threadId?.[1] : null;
  return {
    slug: slug,
    threadId,
    postId: postId || null,
    commentId,
    threadBaseUrl: `/!${slug}/thread/${threadId}`,
    pageType: getPageType(router),
  } as T;
};

const samePage = (newPage: PageDetails, oldPage: PageDetails) => {
  return JSON.stringify(newPage) === JSON.stringify(oldPage);
};

export const usePageDataListener = (
  router: NextRouter,
  serverHostname: string | undefined
) => {
  if (!isInitialized) {
    isInitialized = true;
  }
  // The update of the current state should be done every time the a new router
  // is passed, without waiting for React rendering and for useEffect to trigger.
  // This is because this ""hook"" is used by Page components, and "currentPageData"
  // must be initialized to the correct value as soon as they're initialized during render().
  // With that said, the listeners are instead de-facto react hooks, and thus cannot
  // be called during the render() phase without triggering a "cannot update during render" error.
  // We then use useEffect() to wait for the next "commit phase", and, if there's been an update
  // we dispatch our updates there.
  log("Checking possible route update");
  const currentRealm = getCurrentRealmSlug({ serverHostname });
  const newPageDetails = getPageDetails(router);
  newPageDetails.realmSlug = currentRealm || null;

  if (!samePage(newPageDetails, currentPageData)) {
    currentPageData = newPageDetails;
    dispatchPending = true;
  }
  React.useEffect(() => {
    if (dispatchPending) {
      log("Dispatching updated route to listeners");
      listeners.forEach((listener) => listener(currentPageData));
      dispatchPending = false;
    }
  });
};

export const createLinkTo = ({
  urlPattern,
  url,
  queryParams,
  onLoad,
}: {
  urlPattern?: string;
  url: string;
  onLoad?: () => void;
  queryParams?: { [key: string]: unknown };
}) => {
  return {
    href: url,
    onClick: () => {
      Router.push(urlPattern || url, url, {
        // @ts-expect-error
        query: queryParams,
      }).then(() => {
        window.scrollTo(0, 0);
        onLoad?.();
      });
    },
  };
};
