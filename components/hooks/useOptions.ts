import React from "react";

import { toast } from "@bobaboard/ui-components";
import { useCachedLinks } from "./useCachedLinks";
import {
  faBookOpen,
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
import { DropdownProps } from "@bobaboard/ui-components/dist/common/DropdownListMenu";
import { useEditorsDispatch } from "components/editors/EditorsContext";
import { EditorActions } from "components/editors/types";
import { PostData } from "types/Types";
import { useAuth } from "components/Auth";
import {
  useReadThread,
  useMuteThread,
  useSetThreadHidden,
  useSetThreadView,
} from "./queries/thread";
import { LinkWithAction } from "@bobaboard/ui-components/dist/types";
import { useBoardMetadata } from "./queries/board";
import { useInvalidateNotifications } from "./queries/notifications";

export enum PostOptions {
  COPY_LINK = "COPY_LINK",
  COPY_THREAD_LINK = "COPY_THREAD_LINK",
  EDIT_TAGS = "EDIT_TAGS",
  MARK_READ = "MARK_READ",
  MUTE = "MUTE",
  HIDE = "HIDE",
  UPDATE_VIEW = "UPDATE_VIEW",
  OPEN_AS = "OPEN_AS",
}

const getCopyLinkOption = (href: string, text: string) => ({
  icon: faLink,
  name: text,
  link: {
    onClick: () => {
      const tempInput = document.createElement("input");
      tempInput.value = new URL(href, window.location.origin).toString();
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      toast.success("Link copied!");
    },
  },
});

const getEditTagsOption = (callback: () => void) => ({
  icon: faEdit,
  name: "Edit tags",
  link: {
    onClick: callback,
  },
});

const getMarkReadOption = (callback: () => void) => ({
  icon: faBookOpen,
  name: "Mark read",
  link: {
    onClick: callback,
  },
});

const getMuteThreadOption = (
  muted: boolean,
  callback: (muted: boolean) => void
) => ({
  icon: muted ? faVolumeUp : faVolumeMute,
  name: muted ? "Unmute thread" : "Mute thread",
  link: {
    onClick: () => callback(!muted),
  },
});

const getHideThreadOption = (
  hidden: boolean,
  callback: (hidden: boolean) => void
) => ({
  icon: hidden ? faEye : faEyeSlash,
  name: hidden ? "Unhide thread" : "Hide thread",
  link: {
    onClick: () => callback(!hidden),
  },
});

const getUpdateViewOption = (
  currentView: PostData["defaultView"],
  callback: (updatedView: PostData["defaultView"]) => void
) => ({
  icon: faEdit,
  name: "Change default view",
  options: [
    {
      icon: faCodeBranch,
      name: "Thread",
      link: {
        onClick: () => callback("thread"),
      },
    },
    {
      icon: faImages,
      name: "Gallery",
      link: {
        onClick: () => callback("gallery"),
      },
    },
    {
      icon: faFilm,
      name: "Timeline",
      link: {
        onClick: () => callback("timeline"),
      },
    },
  ].filter((option) => option.name.toLowerCase() != currentView),
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

const usePostOptions = ({
  options,
  data: { threadId, slug, postId, ...data },
}: {
  options: PostOptions[];
  isLoggedIn: boolean;
  data: {
    slug: string;
    threadId: string;
    postId: string;
    own: boolean;
    currentView: PostData["defaultView"];
    hidden?: boolean;
    muted?: boolean;
  };
}): DropdownProps["options"] => {
  const { getLinkToPost, getLinkToThread } = useCachedLinks();
  const { isLoggedIn } = useAuth();
  const editorDispatch = useEditorsDispatch();
  const readThread = useReadThread();
  const hideThread = useSetThreadHidden();
  const muteThread = useMuteThread();
  const setThreadView = useSetThreadView();
  const { boardMetadata } = useBoardMetadata({ boardId: slug });
  const refetchNotifications = useInvalidateNotifications();

  const editTagsCallback = React.useCallback(() => {
    editorDispatch({
      type: EditorActions.EDIT_TAGS,
      payload: {
        boardSlug: slug,
        contributionId: postId,
        threadId: threadId,
      },
    });
  }, [slug, postId, threadId, editorDispatch]);

  const markReadCallback = React.useCallback(() => {
    readThread(
      {
        threadId,
        slug,
      },
      {
        onSuccess: () => {
          refetchNotifications();
        },
      }
    );
  }, [threadId, slug, readThread, refetchNotifications]);

  const hideThreadCallback = React.useCallback(
    (hide: boolean) => {
      hideThread(
        {
          threadId,
          slug,
          hide,
        },
        {
          onSuccess: () => {
            refetchNotifications();
          },
        }
      );
    },
    [threadId, slug, hideThread, refetchNotifications]
  );

  const muteThreadCallback = React.useCallback(
    (mute: boolean) => {
      muteThread(
        {
          threadId,
          slug,
          mute,
        },
        {
          onSuccess: () => {
            refetchNotifications();
          },
        }
      );
    },
    [threadId, slug, muteThread, refetchNotifications]
  );

  const setThreadViewCallback = React.useCallback(
    (view: PostData["defaultView"]) => {
      setThreadView({
        threadId,
        slug,
        view,
      });
    },
    [setThreadView, threadId, slug]
  );

  const getOption = React.useCallback(
    (option: PostOptions) => {
      switch (option) {
        case PostOptions.COPY_LINK:
          return getCopyLinkOption(
            getLinkToPost({
              slug: slug,
              postId: postId,
              threadId: threadId,
            })?.href as string,
            "Copy link"
          );
        case PostOptions.COPY_THREAD_LINK:
          return getCopyLinkOption(
            getLinkToThread({
              slug: slug,
              threadId: threadId,
            })?.href as string,
            "Copy thread link"
          );
        case PostOptions.HIDE:
          if (!isLoggedIn || data.hidden == undefined) {
            return null;
          }
          return getHideThreadOption(data.hidden, hideThreadCallback);
        case PostOptions.MUTE:
          if (!isLoggedIn || data.muted == undefined) {
            return null;
          }
          return getMuteThreadOption(data.muted, muteThreadCallback);
        case PostOptions.MARK_READ:
          if (!isLoggedIn) {
            return null;
          }
          return getMarkReadOption(markReadCallback);
        case PostOptions.UPDATE_VIEW:
          if (!isLoggedIn || !data.own) {
            return null;
          }
          return getUpdateViewOption(data.currentView, setThreadViewCallback);
        case PostOptions.EDIT_TAGS:
          if (
            !isLoggedIn ||
            (!data.own && !boardMetadata?.permissions?.postPermissions.length)
          ) {
            return null;
          }
          return getEditTagsOption(editTagsCallback);
        case PostOptions.OPEN_AS:
          return getOpenAsOptions((view) =>
            getLinkToThread({
              slug: slug,
              threadId: threadId,
              view,
            })
          );
      }
    },
    [
      isLoggedIn,
      slug,
      postId,
      threadId,
      boardMetadata,
      editTagsCallback,
      getLinkToPost,
      getLinkToThread,
      hideThreadCallback,
      markReadCallback,
      muteThreadCallback,
      setThreadViewCallback,
      data.hidden,
      data.muted,
      data.own,
      data.currentView,
    ]
  );

  const dropdownOptions = React.useMemo(() => {
    return options.map(getOption).filter((option) => option != null);
  }, [options, getOption]);

  return dropdownOptions as DropdownProps["options"];
};

export { usePostOptions };
