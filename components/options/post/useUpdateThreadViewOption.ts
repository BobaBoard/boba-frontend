import { PostData, PostType } from "types/Types";
import {
  faCodeBranch,
  faEdit,
  faFilm,
  faImages,
} from "@fortawesome/free-solid-svg-icons";

import React from "react";
import { useAuth } from "components/Auth";
import { useSetThreadView } from "queries/thread";

export const useUpdateThreadViewOption = ({
  threadId,
  boardId,
  post,
  currentView,
}: {
  boardId: string | null;
  threadId: string;
  currentView: PostData["defaultView"];
  post: PostType | undefined;
}) => {
  const { isLoggedIn } = useAuth();
  const setThreadView = useSetThreadView();
  return React.useMemo(() => {
    if (!isLoggedIn || !post?.isOwn) {
      return null;
    }

    const setView = (view: PostData["defaultView"]) => {
      if (!boardId) {
        return;
      }
      setThreadView({
        threadId,
        boardId,
        view,
      });
    };
    return {
      icon: faEdit,
      name: "Change default view",
      options: [
        {
          icon: faCodeBranch,
          name: "Thread",
          link: {
            onClick: () => setView("thread"),
          },
        },
        {
          icon: faImages,
          name: "Gallery",
          link: {
            onClick: () => setView("gallery"),
          },
        },
        {
          icon: faFilm,
          name: "Timeline",
          link: {
            onClick: () => setView("timeline"),
          },
        },
      ].filter((option) => option.name.toLowerCase() != currentView),
    };
  }, [isLoggedIn, post, boardId, threadId, currentView, setThreadView]);
};
