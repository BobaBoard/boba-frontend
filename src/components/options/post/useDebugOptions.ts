import { PostType } from "types/Types";
import React from "react";
import { copyText } from "lib/text";
import { faBug } from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { toast } from "@bobaboard/ui-components";

enum DebugOptions {
  COPY_CONTENT_DATA = "COPY_CONTENT_DATA",
  COPY_POST_ID = "COPY_POST_ID",
}
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
const debugCallback = (option: DebugOptions, post: PostType) => {
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
};
export const useDebugOptions = ({ post }: { post: PostType | undefined }) => {
  const debugOptions = React.useMemo(() => {
    if (!post) {
      return [];
    }
    return getDebugOption((option) => debugCallback(option, post));
  }, [post]);
  return debugOptions;
};
