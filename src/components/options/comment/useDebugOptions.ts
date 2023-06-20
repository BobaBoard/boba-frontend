import { CommentType } from "types/Types";
import React from "react";
import { copyText } from "utils/text-utils";
import { faBug } from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { toast } from "@bobaboard/ui-components";

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
              const content =
                comments.length > 1
                  ? JSON.stringify(
                      comments.map((comment) => JSON.parse(comment.content))
                    )
                  : comments[0].content;
              copyText(content);
              toast.success("Data copied!");
            },
          },
        },
        {
          icon: faCopy,
          name:
            comments.length > 1 ? "Copy comment chain id" : "Copy comment id",
          link: {
            onClick: () => {
              copyText(comments[0].commentId);
              toast.success("Data copied!");
            },
          },
        },
      ],
    };
  }, [comments]);
};
