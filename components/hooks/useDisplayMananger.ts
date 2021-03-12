import { useThreadContext } from "components/thread/ThreadContext";
import React, { SetStateAction } from "react";

import { THREAD_VIEW_MODES } from "../thread/useThreadView";

import debug from "debug";
const log = debug("bobafrontend:useDisplayManager-log");
const info = debug("bobafrontend:useDisplayManager-info");

const useStateWithCallback = <T extends any>(
  initialState: T
): [T, (value: SetStateAction<T>, callback?: (state: T) => void) => void] => {
  const callbackRef = React.useRef<(state: T) => void>(null);
  const [value, setValue] = React.useState(initialState);

  React.useEffect(() => {
    callbackRef.current?.(value);
    // @ts-ignore
    callbackRef.current = null;
  }, [value]);

  const setValueWithCallback = React.useCallback((newValue, callback) => {
    // @ts-ignore
    callbackRef.current = callback;

    return setValue(newValue);
  }, []);

  return [value, setValueWithCallback];
};

const READ_MORE_STEP = 5;
export const useDisplayManager = (currentThreadViewMode: THREAD_VIEW_MODES) => {
  const [maxDisplay, setMaxDisplay] = useStateWithCallback(READ_MORE_STEP);
  const { threadDisplaySequence, isFetching } = useThreadContext();

  React.useEffect(() => {
    setMaxDisplay(READ_MORE_STEP);
  }, [currentThreadViewMode, setMaxDisplay]);

  const displayMore = React.useCallback(
    (callback: (newMax: number) => void) => {
      setMaxDisplay(
        (maxDisplay) => maxDisplay + READ_MORE_STEP,
        (maxDisplay) => {
          callback(maxDisplay);
        }
      );
    },
    [setMaxDisplay]
  );

  React.useEffect(() => {
    if (isFetching || currentThreadViewMode != THREAD_VIEW_MODES.THREAD) {
      return;
    }
    let id: number;
    let timeout: NodeJS.Timeout;
    const idleCallback = () => {
      log(`Browser idle (or equivalent). Loading more.....`);
      requestAnimationFrame(() =>
        setMaxDisplay(
          (current) => current + 10,
          (newValue) => {
            log(
              `New total posts loaded: ${newValue}. Total posts: ${threadDisplaySequence.length}`
            );
            if (newValue < threadDisplaySequence.length) {
              timeout = setTimeout(() => {
                log(`Creating request for further load at next idle step.`);
                // @ts-ignore
                id = requestIdleCallback(idleCallback /*, { timeout: 2000 }*/);
              }, 5000);
            }
          }
        )
      );
    };
    // @ts-ignore
    requestIdleCallback(idleCallback /*, { timeout: 500 }*/);
    return () => {
      if (id) {
        // @ts-ignore
        cancelIdleCallback(id);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [
    isFetching,
    threadDisplaySequence.length,
    setMaxDisplay,
    currentThreadViewMode,
  ]);

  return React.useMemo(() => ({ setMaxDisplay, maxDisplay, displayMore }), [
    setMaxDisplay,
    maxDisplay,
    displayMore,
  ]);
};

export type DisplayManager = ReturnType<typeof useDisplayManager>;
