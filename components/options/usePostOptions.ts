import { PostData, PostType } from "types/Types";
import {
  faCodeBranch,
  faFilm,
  faImages,
  faLink,
  faReply,
} from "@fortawesome/free-solid-svg-icons";

import { DropdownProps } from "@bobaboard/ui-components/dist/common/DropdownListMenu";
import { LinkWithAction } from "@bobaboard/ui-components/dist/types";
import React from "react";
import { copyText } from "utils/text-utils";
import { toast } from "@bobaboard/ui-components";
import { useBoardMetadata } from "queries/board";
import { useCachedLinks } from "../hooks/useCachedLinks";
import { useDebugOptions } from "./post/useDebugOptions";
import { useEditTagsOption } from "./post/useEditTagsOption";
import { useHideThreadOption } from "./post/useHideThreadOption";
import { useMarkReadOption } from "./post/useMarkReadOption";
import { useMuteThreadOption } from "./post/useMuteThreadOption";
import { useStarThreadOption } from "./post/useStarThreadOption";
import { useUpdateThreadViewOption } from "./post/useUpdateThreadViewOption";

export enum PostOptions {
  COPY_LINK = "COPY_LINK",
  COPY_THREAD_LINK = "COPY_THREAD_LINK",
  EDIT_TAGS = "EDIT_TAGS",
  MARK_READ = "MARK_READ",
  MUTE = "MUTE",
  HIDE = "HIDE",
  STAR = "STAR",
  UPDATE_VIEW = "UPDATE_VIEW",
  OPEN_AS = "OPEN_AS",
  DEBUG = "DEBUG",
}

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
    starred?: boolean;
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
  const starThreadOption = useStarThreadOption({
    threadId,
    boardId,
    starred: data.starred,
  });
  const editTagsOption = useEditTagsOption({ threadId, boardId, post });
  const updateViewOption = useUpdateThreadViewOption({
    threadId,
    boardId,
    post,
    currentView: data.currentView,
  });
  const debugOptions = useDebugOptions({ post });

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
        case PostOptions.STAR:
          return starThreadOption;
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
          return debugOptions;
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
      starThreadOption,
      editTagsOption,
      debugOptions,
    ]
  );

  const dropdownOptions = React.useMemo(() => {
    return options.map(getOption).filter((option) => option != null);
  }, [options, getOption]);

  return dropdownOptions as DropdownProps["options"];
};

export { usePostOptions };
