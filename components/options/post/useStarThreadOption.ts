import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import React from "react";
import { useAuth } from "components/Auth";
import { useInvalidateNotifications } from "queries/notifications";
import { useSetThreadStarred } from "queries/thread";

export const useStarThreadOption = ({
  starred,
  boardId,
  threadId,
}: {
  starred: boolean | undefined;
  boardId: string | null;
  threadId: string;
}) => {
  const { isLoggedIn } = useAuth();
  const starThread = useSetThreadStarred();
  const refetchNotifications = useInvalidateNotifications();

  return React.useMemo(() => {
    if (!isLoggedIn || starred === undefined) {
      return null;
    }
    return {
      icon: starred ? faEye : faEyeSlash,
      name: starred ? "Unstar thread" : "Star thread",
      link: {
        onClick: () => {
          if (!boardId) {
            return;
          }
          starThread(
            {
              threadId,
              boardId,
              star: !starred,
            },
            {
              onSuccess: () => {
                refetchNotifications();
              },
            }
          );
        },
      },
    };
  }, [threadId, boardId, starThread, refetchNotifications, starred, isLoggedIn]);
};
