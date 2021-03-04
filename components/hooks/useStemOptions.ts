import React from "react";
import { useAuth } from "../Auth";
import { EditorActions, useEditorsDispatch } from "../editors/EditorsContext";
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
  const dispatch = useEditorsDispatch();

  const onNewContribution = React.useCallback(
    (replyToContributionId: string) => {
      dispatch({
        type: EditorActions.NEW_CONTRIBUTION,
        payload: {
          boardSlug,
          threadId,
          replyToContributionId,
        },
      });
    },
    [boardSlug, threadId]
  );

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
