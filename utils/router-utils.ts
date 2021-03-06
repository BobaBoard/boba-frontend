import { NextRouter } from "next/router";
import React from "react";

import debug from "debug";
const log = debug("bobafrontend:router-utils-log");

interface PageDetails {
  slug: string | null;
  threadId: string | null;
  postId: string | null;
  threadBaseUrl: string | null;
}

export interface ThreadPageDetails {
  slug: string;
  threadId: string;
  postId: string | null;
  threadBaseUrl: string;
}

export interface BoardPageDetails {
  slug: string;
  threadId: null;
  postId: null;
  threadBaseUrl: null;
}

let isInitialized = false;
let dispatchPending = false;
let currentPageData: PageDetails = {
  slug: null,
  threadId: null,
  postId: null,
  threadBaseUrl: null,
};
let listeners: React.Dispatch<React.SetStateAction<PageDetails>>[] = [];

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

const maybeUpdateFromQuery = (query: NextRouter["query"]) => {
  log("Checking possible route update");
  const newPageDetails = getPageDetails(query);
  if (!samePage(newPageDetails, currentPageData)) {
    currentPageData = newPageDetails;
    return true;
  }
  return false;
};
export const getPageDetails = <T extends PageDetails>(
  query: NextRouter["query"]
) => {
  const slug = (query.boardId as string)?.substring(1) || null;
  const threadId = (query.threadId?.[0] as string) || null;
  return {
    slug: slug,
    threadId,
    postId: query.threadId?.[1] || null,
    threadBaseUrl: `/!${slug}/thread/${threadId}`,
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
  dispatchPending = dispatchPending || maybeUpdateFromQuery(router.query);
  React.useEffect(() => {
    if (dispatchPending) {
      log("Dispatching updated route to listeners");
      listeners.forEach((listener) => listener(currentPageData));
      dispatchPending = false;
    }
  });
};
