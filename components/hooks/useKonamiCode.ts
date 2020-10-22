import React from "react";

const KEYS = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];
let currentIndex = 0;

export const useKonamiCode = (onSuccess: () => void) => {
  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.code == KEYS[currentIndex]) {
        currentIndex++;
        if (currentIndex == KEYS.length) {
          console.log("IT'S DONE");
          onSuccess();
          currentIndex = 0;
        }
      } else {
        currentIndex = 0;
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);
};
