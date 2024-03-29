import { BoardData, BoardSummary, RealmType } from "types/Types";

import Head from "next/head";
import React from "react";
import { getDeltaSummary } from "@bobaboard/ui-components";
import { useBoardSummaryBySlug } from "lib/api/hooks/board";
import { useRealmContext } from "contexts/RealmContext";

export const getTitle = (
  currentBoardData: BoardSummary | BoardData | undefined | null,
  threadSummary: ReturnType<typeof getDeltaSummary> | undefined,
  realmData: RealmType
) => {
  const currentSlugString = currentBoardData
    ? `!${currentBoardData.slug} — `
    : "";
  if (threadSummary?.title) {
    return `${threadSummary.title} — ${currentSlugString}BobaBoard ${realmData.slug}`;
  }
  return `${currentSlugString}BobaBoard ${realmData.slug} — ${realmData.title}`;
};

const getImage = (
  currentBoardData: BoardSummary | BoardData | undefined | null,
  threadSummary: ReturnType<typeof getDeltaSummary> | undefined,
  realmData: RealmType
) => {
  if (threadSummary?.images?.length) {
    return threadSummary.images[0];
  }
  return currentBoardData
    ? currentBoardData.avatarUrl
    : realmData.icon
    ? realmData.icon
    : "https://v0.boba.social/bobatan.png";
};

const getDescription = (
  currentBoardData: BoardSummary | BoardData | undefined | null,
  threadSummary: ReturnType<typeof getDeltaSummary> | undefined,
  realmData: RealmType
) => {
  if (threadSummary?.text) {
    let summaryText = threadSummary.text;
    if (summaryText.startsWith(threadSummary.title + "\n")) {
      summaryText = summaryText.substring(summaryText.indexOf("\n") + 1);
    }
    return summaryText;
  }
  return currentBoardData
    ? currentBoardData.tagline
    : realmData.description
    ? realmData.description
    : `BobaBoard is an upcoming commmunity (and platform) aiming to balance the freedom and wonder of the early 00s web with a modern user experience and ethos. Feel free to look around, but remember: what you see is Work in Progress! Read more (and get involved) at www.bobaboard.com.`;
};

const OpenGraphMeta = ({
  slug,
  threadSummary,
}: {
  slug: string | undefined;
  threadSummary: ReturnType<typeof getDeltaSummary> | undefined;
}) => {
  const boardSummary = useBoardSummaryBySlug(slug || null);
  const realmData = useRealmContext();
  return (
    <Head>
      <title>{getTitle(boardSummary, threadSummary, realmData)}</title>
      <meta
        property="og:title"
        content={getTitle(boardSummary, threadSummary, realmData)}
      />
      <meta property="og:type" content="website" />
      <meta
        property="og:description"
        content={getDescription(boardSummary, threadSummary, realmData)}
      />
      <meta
        property="og:image"
        content={getImage(boardSummary, threadSummary, realmData)}
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@BobaBoard" />
      <meta
        name="twitter:title"
        content={getTitle(boardSummary, threadSummary, realmData)}
      />
      <meta
        name="twitter:description"
        content={getDescription(boardSummary, threadSummary, realmData)}
      />
      <meta
        name="twitter:image"
        content={getImage(boardSummary, threadSummary, realmData)}
      />
    </Head>
  );
};

export default OpenGraphMeta;
