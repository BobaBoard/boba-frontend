import { CommentType } from "types/Types";
import React from "react";
import { copyText } from "utils/text-utils";
import { faBug } from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { toast } from "@bobaboard/ui-components";

enum DebugOptions {
  COPY_CONTENT_DATA = "COPY_CONTENT_DATA",
  COPY_CHAIN_CONTENT_DATA = "COPY_CHAIN_CONTENT_DATA",
}

export const useDebugOptions = (props: { comments: CommentType[] }) => {
  const { comments } = props;
  return React.useMemo(() => {
    return {
      icon: faBug,
      name: "Debug",
      options: [
        {
          icon: faCopy,
          name: "Copy content data",
          link: {
            onClick: () => {
              copyText(comments[0].content);
              toast.success("Data copied!");
            },
          },
        },
        {
          icon: faCopy,
          name: "Copy comment chain content data",
          link: {
            onClick: () => {
              const chainContent = JSON.stringify(
                comments.map((comment) => JSON.parse(comment.content))
              );
              copyText(chainContent);
              toast.success("Data copied!");
            },
          },
        },
      ],
    };
  }, [comments]);
};
