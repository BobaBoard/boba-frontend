import { faVolumeMute, faVolumeUp } from "@fortawesome/free-solid-svg-icons";

import React from "react";
import { useAuth } from "components/Auth";
import { useInvalidateNotifications } from "lib/api/hooks/notifications";
import { useMuteThread } from "lib/api/hooks/thread";

export const useMuteThreadOption = ({
  muted,
  boardId,
  threadId,
}: {
  muted: boolean | undefined;
  boardId: string | null;
  threadId: string;
}) => {
  const { isLoggedIn } = useAuth();
  const muteThread = useMuteThread();
  const refetchNotifications = useInvalidateNotifications();
  return React.useMemo(() => {
    if (!isLoggedIn || muted === undefined) {
      return null;
    }
    return {
      icon: muted ? faVolumeUp : faVolumeMute,
      name: muted ? "Unmute thread" : "Mute thread",
      link: {
        onClick: () => {
          if (!boardId) {
            return;
          }
          muteThread(
            {
              threadId,
              boardId,
              mute: !muted,
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
  }, [muted, boardId, threadId, muteThread, refetchNotifications, isLoggedIn]);
};
