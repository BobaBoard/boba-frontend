import React from "react";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "components/Auth";
import { useInvalidateNotifications } from "lib/api/hooks/notifications";
import { useReadThread } from "lib/api/hooks/thread";

export const useMarkReadOption = ({
  boardId,
  threadId,
}: {
  boardId: string | null;
  threadId: string;
}) => {
  const { isLoggedIn } = useAuth();
  const readThread = useReadThread();
  const refetchNotifications = useInvalidateNotifications();

  return React.useMemo(() => {
    if (!isLoggedIn) {
      return null;
    }

    return {
      icon: faBookOpen,
      name: "Mark read",
      link: {
        onClick: () => {
          if (!boardId) {
            return;
          }
          readThread(
            {
              threadId,
              boardId,
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
  }, [boardId, threadId, readThread, refetchNotifications, isLoggedIn]);
};
