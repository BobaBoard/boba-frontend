import { BoardData, BoardSummary } from "types/Types";

import Head from "next/head";
import React from "react";
import { getDeltaSummary } from "@bobaboard/ui-components";

export const getTitle = (
  currentBoardData: BoardSummary | BoardData | undefined | null,
  threadSummary: ReturnType<typeof getDeltaSummary> | undefined
) => {
  const currentSlugString = currentBoardData
    ? `!${currentBoardData.slug} — `
    : "";
  if (threadSummary?.title) {
    return `${threadSummary.title} — ${currentSlugString}BobaBoard v0`;
  }
  return `${currentSlugString}BobaBoard v0 — Where the bugs are funny and the people are cool!`;
};

const getImage = (
  currentBoardData: BoardSummary | BoardData | undefined,
  threadSummary: ReturnType<typeof getDeltaSummary> | undefined
) => {
  if (threadSummary?.images?.length) {
    return threadSummary.images[0];
  }
  return currentBoardData
    ? currentBoardData.avatarUrl
    : "https://v0.boba.social/bobatan.png";
};

const getDescription = (
  currentBoardData: BoardSummary | BoardData | undefined,
  threadSummary: ReturnType<typeof getDeltaSummary> | undefined
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
    : `BobaBoard is an upcoming commmunity (and platform) aiming to balance the freedom and wonder of the early 00s web with a modern user experience and ethos. Feel free to look around, but remember: what you see is Work in Progress! Read more (and get involved) at www.bobaboard.com.`;
};

const OpenGraphMeta = ({
  currentBoardData,
  threadSummary,
}: {
  currentBoardData: BoardData | BoardSummary | undefined;
  threadSummary: ReturnType<typeof getDeltaSummary> | undefined;
}) => (
  <Head>
    <title>{getTitle(currentBoardData, threadSummary)}</title>
    <meta
      property="og:title"
      content={getTitle(currentBoardData, threadSummary)}
    />
    <meta property="og:type" content="website" />
    <meta
      property="og:description"
      content={getDescription(currentBoardData, threadSummary)}
    />
    <meta
      property="og:image"
      content={getImage(currentBoardData, threadSummary)}
    />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@BobaBoard" />
    <meta
      name="twitter:title"
      content={getTitle(currentBoardData, threadSummary)}
    />
    <meta
      name="twitter:description"
      content={getDescription(currentBoardData, threadSummary)}
    />
    <meta
      name="twitter:image"
      content={getImage(currentBoardData, threadSummary)}
    />
  </Head>
);

export default OpenGraphMeta;
