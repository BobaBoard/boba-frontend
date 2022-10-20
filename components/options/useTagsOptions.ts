import { TagType, TagsType } from "@bobaboard/ui-components";

import React from "react";
import { ThreadPostProps } from "components/thread/ThreadPost";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { isNotNull } from "utils/typescript-utils";
import { useThreadViewContext } from "contexts/ThreadViewContext";

export enum TagsOptions {
  FILTER_BY_CATEGORY = "FILTER_BY_CATEGORY",
}

/**
 * Returns a dropdown menu item for filtering by category tag,
 * but only if the tag this is being requested for is of the right
 * type.
 */
const getTagFilterOption = ({
  tag,
  setActiveFilter,
}: {
  tag: TagsType;
  setActiveFilter: (tag: string) => void;
}) => {
  if (!tag || tag.type == TagType.CATEGORY) {
    return null;
  }

  return {
    icon: faFilter,
    name: "Filter",
    link: {
      onClick: () => {
        setActiveFilter(tag.name);
      },
    },
  };
};

/**
 * Returns a function that given a tag and an option type will
 * return the menu item corresponding to that tag + option combination
 * (if the combination is valid) or null (if that option/tag type
 * combination is not available).
 */
const useGetDropdownItemFromOption = () => {
  const { setActiveFilter } = useThreadViewContext();

  return React.useCallback(
    ({ tag, option }: { tag: TagsType; option: TagsOptions }) => {
      switch (option) {
        case TagsOptions.FILTER_BY_CATEGORY:
          return getTagFilterOption({ tag, setActiveFilter });
      }
    },
    [setActiveFilter]
  );
};

/**
 * Returns a function to get a list of menu options for a given tag. This
 * list will include the option types specified by the options array in
 * input, except for the ones not available for a specific tag type.
 *
 * Note: as long as the reference to the options array is stable,
 * the returned function will also be stable.
 */
export const useGetTagOptions = ({
  options,
}: {
  options: TagsOptions[];
}): ThreadPostProps["getOptionsForTag"] => {
  const getDropdownItem = useGetDropdownItemFromOption();
  return React.useCallback(
    (tag: TagsType) => {
      return (
        options
          .map((option) => getDropdownItem({ option, tag }))
          // Remove anything that's null or undefined (since that means)
          // the tag/option combination is invalid.
          .filter(isNotNull)
      );
    },
    [options, getDropdownItem]
  );
};
