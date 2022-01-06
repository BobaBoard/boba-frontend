import { PostData, PostType } from "types/Types";
import {
  faBookOpen,
  faBug,
  faCodeBranch,
  faEdit,
  faEye,
  faEyeSlash,
  faFilm,
  faImages,
  faLink,
  faReply,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import {
  useMuteThread,
  useReadThread,
  useSetThreadHidden,
  useSetThreadView,
} from "queries/thread";

import { DropdownProps } from "@bobaboard/ui-components/dist/common/DropdownListMenu";
import { EditorActions } from "components/editors/types";
import { LinkWithAction } from "@bobaboard/ui-components/dist/types";
import React from "react";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { isPostEditPermission } from "utils/permissions-utils";
import { toast } from "@bobaboard/ui-components";
import { useAuth } from "components/Auth";
import { useBoardMetadata } from "queries/board";
import { useCachedLinks } from "./useCachedLinks";
import { useEditorsDispatch } from "components/editors/EditorsContext";
import { useInvalidateNotifications } from "queries/notifications";

export enum PostOptions {
  COPY_LINK = "COPY_LINK",
  COPY_THREAD_LINK = "COPY_THREAD_LINK",
  EDIT_TAGS = "EDIT_TAGS",
  MARK_READ = "MARK_READ",
  MUTE = "MUTE",
  HIDE = "HIDE",
  UPDATE_VIEW = "UPDATE_VIEW",
  OPEN_AS = "OPEN_AS",
  DEBUG = "DEBUG",
}

enum DebugOptions {
  COPY_CONTENT_DATA = "COPY_CONTENT_DATA",
  COPY_POST_ID = "COPY_POST_ID",
}

const copyText = (text: string) => {
  const tempInput = document.createElement("input");
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.focus();
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
};

const getCopyLinkOption = (href: string, text: string) => ({
  icon: faLink,
  name: text,
  link: {
    onClick: () => {
      copyText(new URL(href, window.location.origin).toString());

      toast.success("Link copied!");
    },
  },
});

const getDebugOption = (callback: (debugOption: DebugOptions) => void) => ({
  icon: faBug,
  name: "Debug",
  options: [
    {
      icon: faCopy,
      name: "Copy content data",
      link: {
        onClick: () => callback(DebugOptions.COPY_CONTENT_DATA),
      },
    },
    {
      icon: faCopy,
      name: "Copy post id",
      link: {
        onClick: () => callback(DebugOptions.COPY_POST_ID),
      },
    },
  ],
});

const getOpenAsOptions = (
  getLink: (view: PostData["defaultView"]) => LinkWithAction
) => ({
  icon: faReply,
  name: "Open as",
  options: [
    {
      icon: faCodeBranch,
      name: "Thread",
      link: getLink("thread"),
    },
    {
      icon: faImages,
      name: "Gallery",
      link: getLink("gallery"),
    },
    {
      icon: faFilm,
      name: "Timeline",
      link: getLink("timeline"),
    },
  ],
});

const useEditTagsOption = ({
  boardId,
  post,
  threadId,
}: {
  boardId: string | null;
  threadId: string;
  post: PostType | undefined;
}) => {
  const { isLoggedIn } = useAuth();
  const editorDispatch = useEditorsDispatch();
  const { boardMetadata } = useBoardMetadata({ boardId });
  return React.useMemo(() => {
    if (
      !isLoggedIn ||
      !post ||
      (!post.isOwn &&
        !boardMetadata?.permissions?.postPermissions.some(isPostEditPermission))
    ) {
      return null;
    }

    return {
      icon: faEdit,
      name: "Edit tags",
      link: {
        onClick: () => {
          if (!boardMetadata || !post?.postId) {
            return;
          }
          editorDispatch({
            type: EditorActions.EDIT_TAGS,
            payload: {
              boardId: boardMetadata.id,
              contributionId: post.postId,
              threadId: threadId,
            },
          });
        },
      },
    };
  }, [boardMetadata, editorDispatch, isLoggedIn, post, threadId]);
};

const useMuteThreadOption = ({
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

const useHideThreadOption = ({
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

const useMarkReadOption = ({
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

const useUpdateThreadViewOption = ({
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

const usePostOptions = ({
  options,
  data: { threadId, boardId, post, ...data },
}: {
  options: PostOptions[];
  isLoggedIn: boolean;
  data: {
    boardId: string | null;
    threadId: string;
    post: PostType | undefined;
    currentView: PostData["defaultView"];
    hidden?: boolean;
    muted?: boolean;
  };
}): DropdownProps["options"] => {
  const { getLinkToPost, getLinkToThread } = useCachedLinks();
  const { boardMetadata } = useBoardMetadata({ boardId });
  const muteThreadOption = useMuteThreadOption({
    boardId,
    threadId,
    muted: data.muted,
  });
  const markAsReadOption = useMarkReadOption({ boardId, threadId });
  const hideThreadOption = useHideThreadOption({
    threadId,
    boardId,
    hidden: data.hidden,
  });
  const editTagsOption = useEditTagsOption({ threadId, boardId, post });
  const updateViewOption = useUpdateThreadViewOption({
    threadId,
    boardId,
    post,
    currentView: data.currentView,
  });

  const getOption = React.useCallback(
    (option: PostOptions) => {
      if (!boardMetadata || !post) {
        return;
      }
      switch (option) {
        case PostOptions.COPY_LINK:
          return getCopyLinkOption(
            getLinkToPost({
              slug: boardMetadata.slug,
              postId: post.postId,
              threadId: threadId,
            })?.href as string,
            "Copy link"
          );
        case PostOptions.COPY_THREAD_LINK:
          return getCopyLinkOption(
            getLinkToThread({
              slug: boardMetadata.slug,
              threadId: threadId,
            })?.href as string,
            "Copy thread link"
          );
        case PostOptions.HIDE:
          return hideThreadOption;
        case PostOptions.MUTE:
          return muteThreadOption;
        case PostOptions.MARK_READ:
          return markAsReadOption;
        case PostOptions.UPDATE_VIEW:
          return updateViewOption;
        case PostOptions.EDIT_TAGS:
          return editTagsOption;
        case PostOptions.OPEN_AS:
          return getOpenAsOptions((view) =>
            getLinkToThread({
              slug: boardMetadata.slug,
              threadId: threadId,
              view,
            })
          );
        case PostOptions.DEBUG:
          return getDebugOption((option) => {
            switch (option) {
              case DebugOptions.COPY_CONTENT_DATA:
                copyText(post.content);
                break;
              case DebugOptions.COPY_POST_ID:
                copyText(post.postId);
                break;
              default:
                throw new Error("Unrecognized debug option");
            }
            toast.success("Copied!");
          });
      }
    },
    [
      post,
      threadId,
      boardMetadata,
      getLinkToPost,
      getLinkToThread,
      updateViewOption,
      markAsReadOption,
      muteThreadOption,
      hideThreadOption,
      editTagsOption,
    ]
  );

  const dropdownOptions = React.useMemo(() => {
    return options.map(getOption).filter((option) => option != null);
  }, [options, getOption]);

  return dropdownOptions as DropdownProps["options"];
};

export { usePostOptions };
