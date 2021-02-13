import Router from "next/router";

export const BOARD_URL_PATTERN = "/[boardId]";
export const THREAD_URL_PATTERN = "/[boardId]/thread/[...threadId]";
export const createLinkTo = ({
  urlPattern,
  url,
  queryParams,
  onLoad,
}: {
  urlPattern?: string;
  url: string;
  onLoad?: () => void;
  queryParams?: { [key: string]: any };
}) => {
  return {
    href: url,
    onClick: () => {
      Router.push(urlPattern || url, url, {
        shallow: true,
        query: queryParams,
      }).then(() => {
        window.scrollTo(0, 0);
        onLoad?.();
      });
    },
  };
};
