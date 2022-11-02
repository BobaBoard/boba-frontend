import {
  faAngleDoubleUp,
  faCompressArrowsAlt,
  faPlusSquare,
} from "@fortawesome/free-solid-svg-icons";

import React from "react";
import { RealmPermissions } from "types/Types";
import { useEditorsState } from "components/editors/EditorsContext";
import { useRealmPermissions } from "contexts/RealmContext";

export const useStemOptions = ({
  onCollapse,
  onScrollTo,
  onReply,
}: {
  boardSlug: string;
  threadId: string;
  onCollapse: (levelId: string) => void;
  onScrollTo: (levelId: string) => void;
  onReply: (levelId: string) => void;
}) => {
  const realmPermissions = useRealmPermissions();
  const editorState = useEditorsState();

  return React.useCallback(
    (levelId) => {
      const options = [
        {
          name: "collapse",
          icon: faCompressArrowsAlt,
          link: {
            onClick: () => {
              onCollapse(levelId);
            },
          },
        },
        {
          name: "beam up",
          icon: faAngleDoubleUp,
          link: {
            onClick: () => {
              onScrollTo(levelId);
            },
          },
        },
      ];

      if (
        realmPermissions.includes(RealmPermissions.POST_ON_REALM) &&
        !editorState.isOpen
      ) {
        options.push({
          name: "reply up",
          icon: faPlusSquare,
          link: {
            onClick: () => {
              onReply(levelId);
            },
          },
        });
      }
      return options;
    },
    [editorState.isOpen, onCollapse, onReply, onScrollTo, realmPermissions]
  );
};
