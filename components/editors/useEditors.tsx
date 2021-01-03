import React from "react";

import PostEditorModal from "./PostEditorModal";
import CommentEditorModal from "./CommentEditorModal";
import { useAuth } from "../Auth";
import { CommentType, PostType } from "../../types/Types";
import { ThreadContextType, withThreadData } from "../thread/ThreadQueryHook";
import { useBoardContext } from "../BoardContext";
import { useCachedLinks } from "../hooks/useCachedLinks";
import { ThreadPageDetails, usePageDetails } from "../../utils/router-utils";
import { toast } from "@bobaboard/ui-components";
import {
  updateCommentCache,
  updatePostCache,
  updatePostTagsInCache,
} from "../../utils/queries/cache";

import debug from "debug";
import { useQueryClient } from "react-query";
const log = debug("bobafrontend:useEditors-log");

interface EditorsProps extends ThreadContextType {
  newThread: boolean;
  postReplyId: string | null;
  commentReplyId: {
    postId: string | null;
    commentId: string | null;
  } | null;
  postEdit: PostType | null;
  onDone: () => void;
}
const Editors = React.memo(
  withThreadData<EditorsProps>(
    ({
      newThread,
      commentReplyId,
      postEdit,
      postReplyId,
      onDone,
      personalIdentity,
      categories: threadCategories,
    }) => {
      const { user, isLoggedIn, isPending: isAuthPending } = useAuth();
      const { slug, threadId } = usePageDetails<ThreadPageDetails>();
      const { boardsData } = useBoardContext();
      const currentBoardData = boardsData?.[slug];
      const { getLinkToBoard } = useCachedLinks();
      const queryClient = useQueryClient();
      const allBoards = React.useMemo(
        () =>
          Object.values(boardsData)
            .map((data) => {
              return {
                slug: data.slug,
                avatar: data.avatarUrl,
                color: data.accentColor,
              };
            })
            .sort((b1, b2) => b1.slug.localeCompare(b2.slug)),
        [boardsData]
      );

      if (!isLoggedIn || isAuthPending) {
        return null;
      }
      return (
        <>
          <PostEditorModal
            isOpen={!!postReplyId || !!postEdit || newThread}
            secretIdentity={personalIdentity}
            userIdentity={{
              name: user?.username,
              avatar: user?.avatarUrl,
            }}
            // TODO: this transformation shouldn't be done here.
            additionalIdentities={
              !personalIdentity && currentBoardData?.postingIdentities
                ? currentBoardData.postingIdentities.map((identity) => ({
                    ...identity,
                    avatar: identity.avatarUrl,
                  }))
                : undefined
            }
            onPostSaved={(post: PostType, postedSlug: string) => {
              if (postReplyId || postEdit) {
                log(
                  `Saved new prompt to thread ${threadId}, replying to post ${postReplyId}.`
                );
                log(post);
                if (
                  postEdit &&
                  !updatePostTagsInCache({
                    threadId,
                    postId: post.postId,
                    tags: post.tags,
                  })
                ) {
                  toast.error(`Error updating post cache after editing tags.`);
                } else if (
                  postReplyId &&
                  !updatePostCache({ threadId, post })
                ) {
                  toast.error(
                    `Error updating post cache after posting new post.`
                  );
                }
              } else if (newThread) {
                queryClient.invalidateQueries(["boardActivityData", { slug }]);
                if (postedSlug != slug) {
                  getLinkToBoard(postedSlug).onClick?.();
                }
              }
              onDone();
            }}
            onCloseModal={onDone}
            slug={slug}
            editPost={postEdit}
            replyToPostId={postReplyId}
            uploadBaseUrl={`images/${slug}/${threadId ? threadId + "/" : ""}`}
            suggestedCategories={
              threadId == null
                ? boardsData[slug]?.suggestedCategories
                : threadCategories
            }
            selectableBoards={newThread ? allBoards : undefined}
          />
          <CommentEditorModal
            isOpen={!!commentReplyId}
            userIdentity={{
              name: user?.username,
              avatar: user?.avatarUrl,
            }}
            secretIdentity={personalIdentity}
            additionalIdentities={
              !personalIdentity && currentBoardData?.postingIdentities
                ? currentBoardData.postingIdentities.map((identity) => ({
                    ...identity,
                    avatar: identity.avatarUrl,
                  }))
                : undefined
            }
            onCommentsSaved={(comments: CommentType[]) => {
              log(
                `Saved new comment(s) to thread ${threadId}, replying to post ${commentReplyId}.`
              );
              log(comments);
              if (
                !commentReplyId ||
                !updateCommentCache({
                  threadId,
                  newComments: comments,
                  replyTo: commentReplyId,
                })
              ) {
                toast.error(
                  `Error updating comment cache after posting new comment.`
                );
              }
              onDone();
            }}
            onCloseModal={onDone}
            replyTo={commentReplyId}
          />
        </>
      );
    }
  )
);

export const useEditors = () => {
  const [newThread, setNewThread] = React.useState<boolean>(false);
  const [postReplyId, setPostReplyId] = React.useState<string | null>(null);
  const [postEdit, setPostEdit] = React.useState<PostType | null>(null);
  const [commentReplyId, setCommentReplyId] = React.useState<{
    postId: string | null;
    commentId: string | null;
  } | null>(null);
  const onDone = React.useCallback(() => {
    setPostEdit(null);
    setPostReplyId(null);
    setCommentReplyId(null);
    setNewThread(false);
  }, []);

  return {
    Editors,
    editorsProps: {
      newThread,
      postReplyId,
      postEdit,
      commentReplyId,
      onDone,
    },
    setPostReplyId,
    setPostEdit,
    setCommentReplyId,
    setNewThread,
  };
};
