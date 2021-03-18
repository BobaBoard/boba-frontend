import React from "react";
import { SetStateAction } from "react";

export const useStateWithCallback = <T>(
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
