import React from "react";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { faBug } from "@fortawesome/free-solid-svg-icons";

enum DebugOptions {
  COPY_CONTENT_DATA = "COPY_CONTENT_DATA",
  COPY_CHAIN_CONTENT_DATA = "COPY_CHAIN_CONTENT_DATA",
}
export const useDebugOptions = ({ comment: CommentType, commentChain }) => {
  React.useMemo(() => {
    return {
      icon: faBug,
      name: "Debug",
      options: [
        {
          icon: faCopy,
          name: "Copy content data",
          link: {
            onClick: () => {
              copyText(comment.content);
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
                commentChain.map((comment) => JSON.parse(comment.content)),
              );
              copyText(chainContent);
              toast.success("Data copied!");
            },
          },
        },
      ],
    };
  }, [comment, commentChain])
};
