import { EditorActions } from "components/core/editors/types";
import { PostType } from "types/Types";
import React from "react";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { isPostEditPermission } from "utils/permissions-utils";
import { useAuth } from "components/Auth";
import { useBoardMetadata } from "lib/api/hooks/board";
import { useEditorsDispatch } from "components/core/editors/EditorsContext";

export const useEditTagsOption = ({
  boardId,
  post,
  threadId,
}: {
  boardId: string | null;
  threadId: string;
  post: PostType | undefined;
}) => {
  const { isLoggedIn } = useAuth();
  const editorDispatch = useEditorsDispatch();
  const { boardMetadata } = useBoardMetadata({ boardId });
  return React.useMemo(() => {
    if (
      !isLoggedIn ||
      !post ||
      (!post.isOwn &&
        !boardMetadata?.permissions?.postPermissions.some(isPostEditPermission))
    ) {
      return null;
    }

    return {
      icon: faEdit,
      name: "Edit tags",
      link: {
        onClick: () => {
          if (!boardMetadata || !post?.postId) {
            return;
          }
          editorDispatch({
            type: EditorActions.EDIT_TAGS,
            payload: {
              boardId: boardMetadata.id,
              contributionId: post.postId,
              threadId: threadId,
            },
          });
        },
      },
    };
  }, [boardMetadata, editorDispatch, isLoggedIn, post, threadId]);
};
