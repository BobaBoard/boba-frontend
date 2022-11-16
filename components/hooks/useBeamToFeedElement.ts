import {
  getNextElementInViewIndex,
  tryScrollToElement,
} from "./useBeamToThreadElement";

import { FeedType } from "types/Types";
import React from "react";
import type { UseInfiniteQueryResult } from "react-query";
import debug from "debug";

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
    console.log("redoing the pages");
    return feed.data?.pages.flatMap((page) => page.activity) || [];
  }, [feed.data?.pages]);

  const isAtLastElement = currentIndex == allLoadedThreads.length - 1;
  const canBeamToNext = allLoadedThreads.length > 0 && !isAtLastElement;
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

  const canBeamToPrevious = allLoadedThreads.length > 0 && currentIndex > 0;
  const onBeamToPrevious = React.useCallback(() => {
    setCurrentIndex((currentIndex) => {
      if (!feed.isFetched || !canBeamToPrevious) {
        return currentIndex;
      }

      console.log(currentIndex);
      log(`Finding previous element...`);
      const nextIndex = currentIndex - 1;
      const next = allLoadedThreads[nextIndex];
      console.log(nextIndex);
      console.log(next);
      tryScrollToElement(next, accentColor);
      return nextIndex;
    });
  }, [accentColor, feed.isFetched, allLoadedThreads, canBeamToPrevious]);
  const loadingNext =
    !feed.isFetched ||
    (isAtLastElement && feed.hasNextPage && feed.isFetchingNextPage);
  const loadingPrevious = !feed.isFetched;
  return React.useMemo(
    () => ({
      canBeamToNext,
      canBeamToPrevious,
      onBeamToNext,
      onBeamToPrevious,
      loadingNext,
      loadingPrevious,
    }),
    [
      canBeamToNext,
      canBeamToPrevious,
      onBeamToNext,
      onBeamToPrevious,
      loadingNext,
      loadingPrevious,
    ]
  );
};
