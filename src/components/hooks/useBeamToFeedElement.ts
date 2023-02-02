import { FeedType } from "types/Types";
import React from "react";
import type { UseInfiniteQueryResult } from "react-query";
import debug from "debug";
import { getNextElementInViewIndex } from "./useBeamToThreadElement";
import { tryScrollToElement } from "utils/scroll-utils";

const log = debug("bobafrontend:useBeamToThreadElement-log");
const info = debug("bobafrontend:useBeamToThreadElement-info");

export const useBeamToFeedElement = ({
  feed,
  accentColor,
}: {
  feed: UseInfiniteQueryResult<FeedType>;
  accentColor: string | undefined;
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(-1);
  const allLoadedThreads = React.useMemo(() => {
    return feed.data?.pages.flatMap((page) => page.activity) || [];
  }, [feed.data?.pages]);

  const isAtLastElement = currentIndex == allLoadedThreads.length - 1;
  const canBeamToNext = allLoadedThreads.length > 1 && !isAtLastElement;
  const onBeamToNext = React.useCallback(() => {
    setCurrentIndex((currentIndex) => {
      if (
        !feed.isFetched ||
        allLoadedThreads.length == 0 ||
        currentIndex == allLoadedThreads.length - 1
      ) {
        return currentIndex;
      }
      log(`Finding next element...`);
      const nextIndex = getNextElementInViewIndex({
        currentIndex: currentIndex,
        elementsSequence: allLoadedThreads,
      });
      const next = allLoadedThreads[nextIndex];
      info(allLoadedThreads);
      tryScrollToElement(next, accentColor);
      return nextIndex;
    });
  }, [accentColor, allLoadedThreads, feed.isFetched]);

  const canBeamToPrevious = allLoadedThreads.length > 1 && currentIndex > 0;
  const onBeamToPrevious = React.useCallback(() => {
    setCurrentIndex((currentIndex) => {
      if (!feed.isFetched || !canBeamToPrevious) {
        return currentIndex;
      }

      log(`Finding previous element...`);
      const nextIndex = currentIndex - 1;
      const next = allLoadedThreads[nextIndex];
      tryScrollToElement(next, accentColor);
      return nextIndex;
    });
  }, [accentColor, feed.isFetched, allLoadedThreads, canBeamToPrevious]);

  const loadingNext =
    !feed.isFetched ||
    (isAtLastElement && feed.hasNextPage && feed.isFetchingNextPage);
  const loadingPrevious = !feed.isFetched;

  const resetBeamIndex = React.useCallback(() => {
    setCurrentIndex(-1);
  }, []);

  return React.useMemo(
    () => ({
      canBeamToNext,
      canBeamToPrevious,
      onBeamToNext,
      onBeamToPrevious,
      loadingNext,
      loadingPrevious,
      resetBeamIndex,
    }),
    [
      canBeamToNext,
      canBeamToPrevious,
      onBeamToNext,
      onBeamToPrevious,
      loadingNext,
      loadingPrevious,
      resetBeamIndex,
    ]
  );
};
