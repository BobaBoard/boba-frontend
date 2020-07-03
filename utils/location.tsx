import Router from "next/router";

export const goToThread = (boardId: string, threadId: string) => {
  Router.push(`/[boardId]/thread/[id]`, `/${boardId}/thread/${threadId}`, {
    shallow: true,
  });
};
