import Router from "next/router";

export const BOARD_URL_PATTERN = "/[boardId]";
export const THREAD_URL_PATTERN = "/[boardId]/thread/[...threadId]";
export const createLinkTo = ({
  urlPattern,
  url,
  onLoad,
}: {
  urlPattern?: string;
  url: string;
  onLoad?: () => void;
}) => {
  return {
    href: url,
    onClick: () => {
      Router.push(urlPattern || url, url, {
        shallow: true,
      }).then(() => {
        window.scrollTo(0, 0);
        onLoad?.();
      });
    },
  };
};
