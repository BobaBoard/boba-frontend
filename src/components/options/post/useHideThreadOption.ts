import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import React from "react";
import { useAuth } from "components/Auth";
import { useInvalidateNotifications } from "queries/notifications";
import { useSetThreadHidden } from "queries/thread";

export const useHideThreadOption = ({
  hidden,
  boardId,
  threadId,
}: {
  hidden: boolean | undefined;
  boardId: string | null;
  threadId: string;
}) => {
  const { isLoggedIn } = useAuth();
  const hideThread = useSetThreadHidden();
  const refetchNotifications = useInvalidateNotifications();

  return React.useMemo(() => {
    if (!isLoggedIn || hidden === undefined) {
      return null;
    }
    return {
      icon: hidden ? faEye : faEyeSlash,
      name: hidden ? "Unhide thread" : "Hide thread",
      link: {
        onClick: () => {
          if (!boardId) {
            return;
          }
          hideThread(
            {
              threadId,
              boardId,
              hide: !hidden,
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
  }, [threadId, boardId, hideThread, refetchNotifications, hidden, isLoggedIn]);
};
