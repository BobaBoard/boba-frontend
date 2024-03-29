import React from "react";

let FORCE_HIDE_IDENTITY = false;
let listeners: React.Dispatch<React.SetStateAction<boolean>>[] = [];

const setForceHideIdentity = (hide: boolean) => {
  FORCE_HIDE_IDENTITY = hide;
  // We call each listener to force a state update on dependencies.
  listeners.forEach((listener) => listener(hide));
};
export const useForceHideIdentity = () => {
  const [forceHideIdentity, forceHideIdentityListener] = React.useState(
    FORCE_HIDE_IDENTITY
  );
  const toggleForceHideIdentity = React.useCallback(() => {
    setForceHideIdentity(!forceHideIdentity);
  }, [forceHideIdentity]);

  React.useEffect(() => {
    listeners.push(forceHideIdentityListener);
    return () => {
      listeners = listeners.filter(
        (listener) => listener !== forceHideIdentityListener
      );
    };
  }, []);

  return { forceHideIdentity: FORCE_HIDE_IDENTITY, toggleForceHideIdentity };
};
