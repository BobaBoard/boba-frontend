import React from "react";

import { toast } from "@bobaboard/ui-components";
import { useCachedLinks } from "./useCachedLinks";
import { faEdit, faLink } from "@fortawesome/free-solid-svg-icons";
import { DropdownProps } from "@bobaboard/ui-components/dist/common/DropdownListMenu";

export enum PostOptions {
  COPY_LINK,
  EDIT_TAGS,
}

const usePostOptions = ({
  options,
  isLoggedIn,
  postData,
  onSelectOption,
}: {
  options: PostOptions[];
  isLoggedIn: boolean;
  postData: {
    slug: string;
    threadId: string;
    postId: string;
    own: boolean;
  };
  onSelectOption: (option: PostOptions) => void;
}): DropdownProps["options"] => {
  const { getLinkToPost } = useCachedLinks();
  const dropdownOptions = React.useMemo(() => {
    return options
      .map((option) => {
        switch (option) {
          case PostOptions.COPY_LINK:
            return {
              icon: faLink,
              name: "Copy Link",
              link: {
                onClick: () => {
                  const tempInput = document.createElement("input");
                  tempInput.value = new URL(
                    getLinkToPost({
                      slug: postData.slug,
                      postId: postData.postId,
                      threadId: postData.threadId,
                    })?.href as string,
                    window.location.origin
                  ).toString();
                  document.body.appendChild(tempInput);
                  tempInput.select();
                  document.execCommand("copy");
                  document.body.removeChild(tempInput);
                  toast.success("Link copied!");
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
                  onSelectOption(PostOptions.EDIT_TAGS);
                },
              },
            };
        }
      })
      .filter((option) => option != null);
  }, [options, isLoggedIn, postData]);

  return dropdownOptions as DropdownProps["options"];
};

export { usePostOptions };
