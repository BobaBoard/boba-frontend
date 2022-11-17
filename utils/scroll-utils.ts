import {
  CommentHandler,
  DefaultTheme,
  PostHandler,
} from "@bobaboard/ui-components";
import { CommentType, PostType, ThreadSummaryType } from "types/Types";

import { getThreadElementIdWithType } from "./thread-utils";
import { log } from "debug";

const POST_HANDLERS = new Map<string, PostHandler>();
// This is a PostHandler because a thread handler is just the handler
// of the starter post.
const THREAD_HANDLERS = new Map<string, PostHandler>();
const COMMENT_HANDLERS = new Map<string, CommentHandler>();

type ElementId =
  | { threadId: string }
  | { postId: string }
  | { commentId: string };
const getHtmlElement = (ids: ElementId): HTMLElement | null => {
  if ("threadId" in ids) {
    return document.querySelector(`.thread[data-thread-id='${ids.threadId}']`);
  } else if ("commentId" in ids) {
    return document.querySelector(
      `.comment[data-comment-id='${ids.commentId}']`
    );
  } else if ("postId" in ids) {
    return document.querySelector(`.post[data-post-id='${ids.postId}']`);
  }
  throw new Error("Attempted to fetch a page element of unknown type");
};

const getHandler = (ids: ElementId): PostHandler | CommentHandler | null => {
  if ("threadId" in ids) {
    return THREAD_HANDLERS.get(ids.threadId) || null;
  } else if ("commentId" in ids) {
    return COMMENT_HANDLERS.get(ids.commentId) || null;
  } else if ("postId" in ids) {
    return POST_HANDLERS.get(ids.postId) || null;
  }
  throw new Error("Attempted to fetch a handlers map of unknown type");
};

const scrollToElement = ({
  id,
  color,
}: {
  id: ElementId;
  color: string | undefined;
}) => {
  log(`Beaming to element`, id);
  const element = getHtmlElement(id);
  if (!element) {
    log(`...element not found!`);
    return;
  }
  const observer: IntersectionObserver = new IntersectionObserver(
    (observed) => {
      if (observed[0].isIntersecting) {
        log(`Beam done, highlighting!`);
        getHandler(id)?.highlight(color || DefaultTheme.DEFAULT_ACCENT_COLOR);
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

export const addPostHandlerRef = ({
  postId,
  ref,
}: {
  postId: string;
  ref: PostHandler;
}) => {
  POST_HANDLERS.set(postId, ref);
};

export const removePostHandlerRef = ({ postId }: { postId: string }) => {
  POST_HANDLERS.delete(postId);
};

export const scrollToPost = (postId: string, color: string | undefined) => {
  log(`Beaming up to post with id ${postId}`);
  scrollToElement({ id: { postId }, color });
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

export const addCommentHandlerRef = ({
  commentId,
  ref,
}: {
  commentId: string;
  ref: CommentHandler;
}) => {
  COMMENT_HANDLERS.set(commentId, ref);
};

export const removeCommentHandlerRef = ({
  commentId,
}: {
  commentId: string;
}) => {
  COMMENT_HANDLERS.delete(commentId);
};

export const scrollToComment = (commentId: string, color: string) => {
  log(`Beaming up to post with id ${commentId}`);
  scrollToElement({ id: { commentId }, color });
};

/**
 * Attempts scrolling to element if it's found in page. If not, returns false.
 */
export const tryScrollToElement = (
  threadElement: PostType | CommentType | ThreadSummaryType,
  accentColor: string | undefined
) => {
  const elementId = getThreadElementIdWithType({ threadElement });
  const element = getHtmlElement(elementId);
  if (!element) {
    return false;
  }
  scrollToElement({ id: elementId, color: accentColor });
  return true;
};

/**
 * Checks if the given element has already been scrolled past.
 */
export const isScrolledPast = ({
  threadElement,
}: {
  threadElement: PostType | CommentType | ThreadSummaryType;
}) => {
  const elementId = getThreadElementIdWithType({ threadElement });
  const container = getHtmlElement(elementId);
  if (!container) {
    return false;
  }
  return container.getBoundingClientRect().y <= 0;
};
