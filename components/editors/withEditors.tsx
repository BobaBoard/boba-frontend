import React from "react";

import ContributionEditorModal from "./ContributionEditorModal";
import CommentEditorModal from "./CommentEditorModal";
import { useAuth } from "../Auth";
import { CommentType, PostType } from "../../types/Types";
import { useCachedLinks } from "../hooks/useCachedLinks";
import { Modal, ModalWithButtons, toast } from "@bobaboard/ui-components";
import {
  updateCommentCache,
  updatePostCache,
  updatePostTagsInCache,
} from "../../utils/queries/cache";

import debug from "debug";
import { useQueryClient } from "react-query";
import {
  EditorActions,
  EditorsProvider,
  useEditorsDispatch,
  useEditorsState,
} from "./EditorsContext";
import { usePreventPageChange } from "components/hooks/usePreventPageChange";
import {
  isCommentEditorState,
  isContributionEditorState,
  isEditContribution,
  isNewThread,
} from "./types";
const log = debug("bobafrontend:useEditors-log");

const Editors = () => {
  const { isLoggedIn, isPending: isAuthPending } = useAuth();
  const { getLinkToBoard } = useCachedLinks();
  const queryClient = useQueryClient();
  const dispatch = useEditorsDispatch();
  const onClose = React.useCallback(() => {
    dispatch({ type: EditorActions.CLOSE, payload: {} });
  }, []);
  const state = useEditorsState();
  usePreventPageChange(() => state.isOpen, onClose, [state.isOpen]);
  const [askConfirmation, setAskConfirmation] = React.useState(false);
  const onCancel = React.useCallback(
    (empty) => (empty ? onClose() : setAskConfirmation(true)),
    []
  );

  if (!isLoggedIn || isAuthPending || !state.isOpen) {
    return null;
  }

  return (
    <>
      <Modal isOpen={true}>
        {isContributionEditorState(state) && (
          <ContributionEditorModal
            onPostSaved={(post: PostType, postedSlug: string) => {
              let redirectToBoard: string | null = null;
              if (isNewThread(state)) {
                queryClient.invalidateQueries([
                  "boardActivityData",
                  { slug: state.boardSlug },
                ]);
                if (postedSlug != state.boardSlug) {
                  redirectToBoard = postedSlug;
                }
              } else if (isEditContribution(state)) {
                if (
                  !updatePostTagsInCache(queryClient, {
                    threadId: state.threadId,
                    postId: post.postId,
                    tags: post.tags,
                  })
                ) {
                  toast.error(`Error updating post cache after editing tags.`);
                }
              } else {
                if (
                  !updatePostCache(queryClient, {
                    threadId: state.threadId,
                    post,
                  })
                ) {
                  toast.error(
                    `Error updating post cache after posting new post.`
                  );
                }
              }
              onClose();
              if (redirectToBoard) {
                getLinkToBoard(redirectToBoard).onClick?.();
              }
            }}
            onCancel={onCancel}
          />
        )}
        {isCommentEditorState(state) && (
          <CommentEditorModal
            onCommentsSaved={(comments: CommentType[]) => {
              if (
                !updateCommentCache(queryClient, {
                  threadId: state.threadId,
                  newComments: comments,
                  replyTo: {
                    postId: state.newComment.replyToContributionId,
                    commentId: state.newComment.replyToCommentId,
                  },
                })
              ) {
                toast.error(
                  `Error updating comment cache after posting new comment.`
                );
              } else {
                log(
                  `Saved new comment(s) to thread ${state.threadId}, replying to post ${state.newComment.replyToContributionId}.`
                );
                log(comments);
              }
              onClose();
            }}
            onCancel={onCancel}
          />
        )}
      </Modal>
      <ModalWithButtons
        isOpen={askConfirmation}
        onCloseModal={() => setAskConfirmation(false)}
        onSubmit={() => {
          setAskConfirmation(false);
          onClose();
        }}
        primaryText={"Exterminate!"}
        secondaryText={"Nevermind"}
        shouldCloseOnOverlayClick={false}
      >
        Are you sure?
      </ModalWithButtons>
    </>
  );
};

export const withEditors = function <T>(WrappedComponent: React.FC<T>) {
  const ReturnedComponent: React.FC<T> = (props) => (
    <EditorsProvider>
      {typeof window !== "undefined" && <Editors />}
      <WrappedComponent {...props} />
    </EditorsProvider>
  );
  ReturnedComponent.displayName = `${WrappedComponent.displayName}_withEditors`;
  return ReturnedComponent;
};
