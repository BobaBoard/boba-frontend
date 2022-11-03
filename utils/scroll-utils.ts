import { DefaultTheme, PostHandler } from "@bobaboard/ui-components";

import { log } from "debug";

const postHandlers = new Map<string, PostHandler>();

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
          ?.highlight(color || DefaultTheme.DEFAULT_ACCENT_COLOR),
          observer.disconnect();
      }
    }
  );
  observer.observe(element);
  element.classList.add("outline-hidden");
  window.scroll({
    top:
      element.getBoundingClientRect().top +
      window.pageYOffset -
      (DefaultTheme.HEADER_HEIGHT_PX + 20),
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

export const isPostLoaded = (postId: string): boolean => {
  return !!document.querySelector(`.post[data-post-id='${postId}']`);
};
