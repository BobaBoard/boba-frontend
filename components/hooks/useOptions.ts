import React from "react";

import { toast } from "@bobaboard/ui-components";
import { useCachedLinks } from "./useCachedLinks";
import {
  faBookOpen,
  faEdit,
  faEye,
  faEyeSlash,
  faLink,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { DropdownProps } from "@bobaboard/ui-components/dist/common/DropdownListMenu";
import {
  useMarkThreadAsRead,
  useMuteThread,
  useSetThreadHidden,
} from "./queries/thread";
import { useAuth } from "components/Auth";

export enum PostOptions {
  COPY_LINK,
  COPY_THREAD_LINK,
  EDIT_TAGS,
  MARK_READ,
  MUTE,
  HIDE,
  UPDATE_VIEW,
}

const copyUrlToClipboard = (url: string) => {
  const tempInput = document.createElement("input");
  tempInput.value = new URL(url, window.location.origin).toString();
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
  toast.success("Link copied!");
};

interface PostData {
  slug: string;
  threadId: string;
  postId?: string;
  own: boolean;
  muted: boolean;
  hidden: boolean;
}

// const { getLinkToPost, getLinkToThread } = useCachedLinks();
// copyUrlToClipboard(
//   (option == PostOptions.COPY_THREAD_LINK
//     ? getLinkToThread({
//         slug: postData.slug,
//         threadId: postData.threadId,
//       })
//     : getLinkToPost({
//         slug: postData.slug,
//         postId: postData.postId,
//         threadId: postData.threadId,
//       })
//   )?.href as string
// );

const usePostOptionsReducer = () => {
  const setThreadHidden = useSetThreadHidden();
  const markThreadAsRead = useMarkThreadAsRead();
  const muteThread = useMuteThread();
  const { getLinkToPost, getLinkToThread } = useCachedLinks();
  const { isLoggedIn } = useAuth();

  return (option: PostOptions, postData: PostData) => {
    switch (option) {
      case PostOptions.COPY_LINK:
      case PostOptions.COPY_THREAD_LINK:
        copyUrlToClipboard(
          (option == PostOptions.COPY_THREAD_LINK
            ? getLinkToThread({
                slug: postData.slug,
                threadId: postData.threadId,
              })
            : getLinkToPost({
                slug: postData.slug,
                postId: postData.postId!,
                threadId: postData.threadId,
              })
          )?.href as string
        );
        return;
      case PostOptions.UPDATE_VIEW:
      case PostOptions.EDIT_TAGS:
        throw new Error("Not implemented");
        if (!isLoggedIn || !postData.own) {
          return null;
        }
        // TODO:
        return;
      case PostOptions.MARK_READ:
        if (!isLoggedIn) {
          return null;
        }
        return markThreadAsRead({
          threadId: postData.threadId,
          slug: postData.slug,
        });
      case PostOptions.MUTE:
        if (!isLoggedIn) {
          return null;
        }
        return muteThread({
          threadId: postData.threadId,
          slug: postData.slug,
          mute: !postData.muted,
        });
      case PostOptions.HIDE:
        if (!isLoggedIn) {
          return null;
        }
        return setThreadHidden({
          threadId: postData.threadId,
          slug: postData.slug,
          hide: !postData.hidden,
        });
      default:
        return null;
    }
  };
};

const getPostOptions = ({
  options,
  isLoggedIn,
  postData,
  optionsReducer,
}: {
  options: PostOptions[];
  postData: PostData;
  isLoggedIn: boolean;
  optionsReducer: (option: PostOptions, data: PostData) => void;
}) => {
  return options
    .map((option) => {
      switch (option) {
        case PostOptions.COPY_LINK:
        case PostOptions.COPY_THREAD_LINK:
          return {
            icon: faLink,
            name: "Copy Link",
            link: {
              onClick: () => {
                optionsReducer(option, postData);
              },
            },
          };
        case PostOptions.EDIT_TAGS:
          if (!isLoggedIn || !postData.own) {
            return null;
          }
          return {
            icon: faEdit,
            name: "Edit tags",
            link: {
              onClick: () => {
                optionsReducer(PostOptions.EDIT_TAGS, postData);
              },
            },
          };
        case PostOptions.MARK_READ:
          if (!isLoggedIn) {
            return null;
          }
          return {
            icon: faBookOpen,
            name: "Mark Read",
            link: {
              onClick: () => {
                optionsReducer(PostOptions.MARK_READ, postData);
              },
            },
          };
        case PostOptions.MUTE:
          if (!isLoggedIn) {
            return null;
          }
          return {
            icon: postData.muted ? faVolumeUp : faVolumeMute,
            name: postData.muted ? "Unmute" : "Mute",
            link: {
              onClick: () => {
                optionsReducer(PostOptions.MUTE, postData);
              },
            },
          };
        case PostOptions.HIDE:
          if (!isLoggedIn) {
            return null;
          }
          return {
            icon: postData.hidden ? faEye : faEyeSlash,
            name: postData.hidden ? "Unhide" : "Hide",
            link: {
              onClick: () => {
                optionsReducer(PostOptions.HIDE, postData);
              },
            },
          };
        default:
          return undefined;
      }
    })
    .filter((option) => option != null) as DropdownProps["options"];
};

const getDataId = (postData: PostData) => {
  return `${postData.slug}_${postData.threadId}_${postData.postId || ""}`;
};

const usePostOptionsProvider = ({
  options,
  postsData,
}: {
  options: PostOptions[];
  postsData: PostData[];
}): { get: (postData: PostData) => DropdownProps["options"] } => {
  const optionsReducer = usePostOptionsReducer();
  const { isLoggedIn } = useAuth();
  const memoizedOptions = React.useRef<Map<string, DropdownProps["options"]>>(
    new Map()
  );

  React.useEffect(() => {
    postsData.forEach((postData) => {
      const dataId = getDataId(postData);
      if (!memoizedOptions.current.has(dataId)) {
        const optionsFunction = getPostOptions({
          options,
          isLoggedIn,
          optionsReducer,
          postData,
        });
        memoizedOptions.current.set(dataId, optionsFunction);
      }
    });

    return () => memoizedOptions.current.clear();
  }, [options, postsData]);

  return React.useMemo(
    () => ({
      get: (postData: PostData) => {
        const dataId = getDataId(postData);
        return memoizedOptions.current.get(dataId)!;
      },
    }),
    []
  );
};

export { usePostOptionsProvider };
