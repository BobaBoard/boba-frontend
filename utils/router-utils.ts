import Router, { NextRouter } from "next/router";

import React from "react";
import debug from "debug";

const log = debug("bobafrontend:router-utils-log");

interface PageDetails {
  slug: string | null;
  threadId: string | null;
  postId: string | null;
  threadBaseUrl: string | null;
  pageType: PageTypes | null;
}

export interface ThreadPageDetails {
  slug: string;
  threadId: string;
  postId: string | null;
  threadBaseUrl: string;
  pageType: PageTypes.THREAD | PageTypes.POST;
}

export interface BoardPageDetails {
  slug: string;
  threadId: null;
  postId: null;
  threadBaseUrl: null;
  pageType: PageTypes.BOARD;
}

let isInitialized = false;
let dispatchPending = false;
let currentPageData: PageDetails = {
  slug: null,
  threadId: null,
  postId: null,
  threadBaseUrl: null,
  pageType: null,
};
let listeners: React.Dispatch<React.SetStateAction<PageDetails>>[] = [];

export enum PageTypes {
  HOME = "HOME",
  BOARD = "BOARD",
  THREAD = "THREAD",
  POST = "POST",
  FEED = "FEED",
  SETTINGS = "SETTINGS",
  INVITE = "INVITE",
}

export const BOARD_PATH = "/[boardId]";
export const THREAD_PATH = "/[boardId]/thread/[...threadId]";
export const POST_PATH = "/[boardId]/thread/[...threadId]";
export const FEED_PATH = "/users/feed";
export const PERSONAL_SETTINGS_PATH = "/users/settings";
export const INVITE_PAGE_PATH = "/invite/[inviteId]";

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
    case THREAD_PATH:
      return router.query.threadId?.[1] ? PageTypes.POST : PageTypes.THREAD;
    case FEED_PATH:
      return PageTypes.FEED;
    case PERSONAL_SETTINGS_PATH:
      return PageTypes.SETTINGS;
    case INVITE_PAGE_PATH:
      return PageTypes.INVITE;
    default:
      return null;
  }
};

export const getPageDetails = <T extends PageDetails>(router: NextRouter) => {
  const slug = (router.query.boardId as string)?.substring(1) || null;
  const threadId = (router.query.threadId?.[0] as string) || null;
  return {
    slug: slug,
    threadId,
    postId: router.query.threadId?.[1] || null,
    threadBaseUrl: `/!${slug}/thread/${threadId}`,
    pageType: getPageType(router),
  } as T;
};

const samePage = (newPage: PageDetails, oldPage: PageDetails) => {
  return JSON.stringify(newPage) === JSON.stringify(oldPage);
};

export const usePageDataListener = (router: NextRouter) => {
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
  const newPageDetails = getPageDetails(router);
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
