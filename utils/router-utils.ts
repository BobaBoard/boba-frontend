import { NextRouter, useRouter } from "next/router";

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

export const usePageDetails = <T extends PageDetails>() => {
  const router = useRouter();
  return getPageDetails<T>(router);
};

export const getPageDetails = <T extends PageDetails>(router: NextRouter) => {
  const slug = (router.query.boardId as string)?.substring(1) || null;
  const threadId = (router.query.threadId?.[0] as string) || null;
  return {
    slug: slug,
    threadId,
    postId: router.query.threadId?.[1] || null,
    threadBaseUrl: `/!${slug}/thread/${threadId}`,
  } as T;
};
