import { DefaultTheme, PostHandler } from "@bobaboard/ui-components";

import { log } from "debug";

const postHandlers = new Map<string, PostHandler>();
const THREAD_HANDLERS = new Map<string, PostHandler>();

export const scrollToPost = (postId: string, color: string | undefined) => {
  log(`Beaming up to post with id ${postId}`);
  const element: HTMLElement | null = document.querySelector(
    `.post[data-post-id='${postId}']`
  );
  if (!element) {
    log(`...post not found!`);
    return;
  }
  const observer: IntersectionObserver = new IntersectionObserver(
    (observed) => {
      if (observed[0].isIntersecting) {
        log(`Beam done, highlighting!`);
        postHandlers
          .get(postId)
          ?.highlight(color || DefaultTheme.DEFAULT_ACCENT_COLOR);
        observer.disconnect();
      }
    }
  );
  observer.observe(element);
  window.scroll({
    top:
      element.getBoundingClientRect().top +
      window.pageYOffset -
      (DefaultTheme.HEADER_HEIGHT_PX + 25),
    behavior: "smooth",
  });
};

export const addPostHandlerRef = ({
  postId,
  ref,
}: {
  postId: string;
  ref: PostHandler;
}) => {
  postHandlers.set(postId, ref);
};

export const removePostHandlerRef = ({ postId }: { postId: string }) => {
  postHandlers.delete(postId);
};

export const addThreadHandlerRef = ({
  threadId,
  ref,
}: {
  threadId: string;
  ref: PostHandler;
}) => {
  THREAD_HANDLERS.set(threadId, ref);
};

export const removeThreadHandlerRef = ({ threadId }: { threadId: string }) => {
  THREAD_HANDLERS.delete(threadId);
};

export const isPostLoaded = (postId: string): boolean => {
  return !!document.querySelector(`.post[data-post-id='${postId}']`);
};

const getThreadElement = (threadId: string): HTMLElement | null => {
  return document.querySelector(`.thread[data-thread-id='${threadId}']`);
};

export const isThreadLoaded = (threadId: string): boolean => {
  return !!getThreadElement(threadId);
};
export const scrollToThread = (threadId: string, color: string | undefined) => {
  log(`Beaming up to thread with id ${threadId}`);
  const element: HTMLElement | null = getThreadElement(threadId);
  if (!element) {
    log(`...thread not found!`);
    return;
  }
  const observer: IntersectionObserver = new IntersectionObserver(
    (observed) => {
      if (observed[0].isIntersecting) {
        log(`Beam done, highlighting!`);
        log(THREAD_HANDLERS.get(threadId));
        THREAD_HANDLERS.get(threadId)?.highlight(
          color || DefaultTheme.DEFAULT_ACCENT_COLOR
        ),
          observer.disconnect();
      }
    }
  );
  observer.observe(element);
  // Unsure why we need to request the animation frame here, but long story short
  // I believe if there is a react state update at the same time as this scrolling
  // is triggered, then sometimes the scrolling gets "eaten". Is this true? IDK,
  // but adding this fixed the issue and I have better to do with my life.
  requestAnimationFrame(() => {
    window.scroll({
      top:
        element.getBoundingClientRect().top +
        window.pageYOffset -
        (DefaultTheme.HEADER_HEIGHT_PX + 25),
      behavior: "smooth",
    });
  });
};
