import { CommentType, RealmPermissions } from "types/Types";
import { ThreadPageDetails, usePageDetails } from "utils/router-utils";
import { faArrowRight, faLink } from "@fortawesome/free-solid-svg-icons";
import {
  useCurrentRealmBoardId,
  useRealmPermissions,
} from "contexts/RealmContext";

import { DropdownProps } from "@bobaboard/ui-components/dist/common/DropdownListMenu";
import React from "react";
import { copyText } from "utils/text-utils";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import { getCommentsChain } from "components/thread/CommentsThread";
import { isNotNull } from "utils/typescript-utils";
import { toast } from "@bobaboard/ui-components";
import { useBoardMetadata } from "lib/api/hooks/board";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useDebugOptions } from "./comment/useDebugOptions";
import { useEditorsState } from "components/core/editors/EditorsContext";
import { useThreadContext } from "components/thread/ThreadContext";
import { useThreadEditors } from "components/core/editors/withEditors";

export enum CommentOptions {
  GO_TO_COMMENT = "GO_TO_COMMENT",
  COPY_COMMENT_LINK = "COPY_COMMENT_LINK",
  REPLY_TO_COMMENT = "REPLY_TO_COMMENT",
  DEBUG = "DEBUG",
}

/**
 * Returns an array of dropdown options for the given comment corresponding
 * to the option types passed in the `options` argument. If the current
 * user does not have the required permissions for an option, it silently
 * skips it.
 */
export const useCommentOptions = ({
  comment,
  options,
}: {
  comment: CommentType;
  options: CommentOptions[];
}): DropdownProps["options"] => {
  const { commentId, parentPostId } = comment;
  const { getLinkToComment } = useCachedLinks();
  const { slug, threadId } = usePageDetails<ThreadPageDetails>();
  const boardId = useCurrentRealmBoardId({
    boardSlug: slug,
  });
  const { boardMetadata } = useBoardMetadata({ boardId });
  const realmPermissions = useRealmPermissions();
  const { postCommentsMap } = useThreadContext();
  const { parentChainMap } = postCommentsMap.get(parentPostId)!;
  const { onNewComment } = useThreadEditors();
  const editorState = useEditorsState();

  const linkToComment = getLinkToComment({
    slug: boardMetadata!.slug,
    commentId: commentId,
    threadId: threadId,
  });

  const commentChain = getCommentsChain(comment, parentChainMap);
  const lastCommentChainId = commentChain[commentChain.length - 1].commentId;
  const debugOptions = useDebugOptions({ comments: commentChain });

  // TODO: we should also return null if the editor is open
  const canReplyToComment =
    realmPermissions.includes(RealmPermissions.COMMENT_ON_REALM) &&
    !editorState.isOpen;

  return React.useMemo(
    () =>
      options
        .map((option) => {
          switch (option) {
            case CommentOptions.COPY_COMMENT_LINK: {
              return {
                icon: faLink,
                name: "Copy link to comment",
                link: {
                  // @ts-expect-error TODO: figure this out
                  onClick: () => {
                    copyText(
                      new URL(
                        linkToComment.href,
                        window.location.origin
                      ).toString()
                    );
                    toast.success("Link copied!");
                  },
                },
              };
            }
            case CommentOptions.GO_TO_COMMENT: {
              return {
                name: "Go to comment",
                icon: faArrowRight,
                link: linkToComment,
              };
            }
            case CommentOptions.REPLY_TO_COMMENT: {
              if (!canReplyToComment) {
                return null;
              }
              return {
                name: "Reply",
                icon: faComment,
                link: {
                  onClick: () => onNewComment(lastCommentChainId, parentPostId),
                  label: "Add a new comment",
                },
              };
            }
            case CommentOptions.DEBUG: {
              return debugOptions;
            }
          }
        })
        // Filter out the options that are not available (and thus have returned
        // null).
        .filter(isNotNull),
    [
      options,
      canReplyToComment,
      lastCommentChainId,
      linkToComment,
      onNewComment,
      parentPostId,
      debugOptions,
    ]
  );
};
