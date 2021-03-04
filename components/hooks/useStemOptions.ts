import React from "react";
import { useAuth } from "../Auth";
import {
  faAngleDoubleUp,
  faCompressArrowsAlt,
  faPlusSquare,
} from "@fortawesome/free-solid-svg-icons";

export const useStemOptions = ({
  boardSlug,
  threadId,
  onCollapse,
  onScrollTo,
  onReply,
}: {
  boardSlug: string;
  threadId: string;
  onCollapse: (levelId: string) => void;
  onScrollTo: (levelId: string) => void;
  onReply: (levelId: string) => void;
}) => {
  const { isLoggedIn } = useAuth();

  return React.useCallback(
    (levelId) => {
      const options = [
        {
          name: "collapse",
          icon: faCompressArrowsAlt,
          link: {
            onClick: () => {
              onCollapse(levelId);
            },
          },
        },
        {
          name: "beam up",
          icon: faAngleDoubleUp,
          link: {
            onClick: () => {
              onScrollTo(levelId);
            },
          },
        },
      ];

      if (isLoggedIn) {
        options.push({
          name: "reply up",
          icon: faPlusSquare,
          link: {
            onClick: () => {
              onReply(levelId);
            },
          },
        });
      }
      return options;
    },
    [isLoggedIn]
  );
};
