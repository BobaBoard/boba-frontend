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
import { usePageDetails } from "utils/router-utils";
import { useRefetchBoardActivity } from "components/hooks/queries/board-activity";
const log = debug("bobafrontend:useEditors-log");

const Editors = () => {
  const { isLoggedIn, isPending: isAuthPending } = useAuth();
  const { getLinkToBoard } = useCachedLinks();
  const queryClient = useQueryClient();
  const dispatch = useEditorsDispatch();
  const onClose = React.useCallback(() => {
    dispatch({ type: EditorActions.CLOSE, payload: {} });
  }, [dispatch]);
  const state = useEditorsState();
  usePreventPageChange(() => state.isOpen, onClose, [state.isOpen]);
  const [askConfirmation, setAskConfirmation] = React.useState(false);
  const onCancel = React.useCallback(
    (empty) => (empty ? onClose() : setAskConfirmation(true)),
    [onClose, setAskConfirmation]
  );
  const onCloseModal = React.useCallback(() => setAskConfirmation(false), []);
  const onSubmit = React.useCallback(() => {
    setAskConfirmation(false);
    onClose();
  }, [onClose]);
  const refetchBoardActivity = useRefetchBoardActivity();
  const [isRefetching, setRefetching] = React.useState(false);
  if (!isLoggedIn || isAuthPending || !state.isOpen) {
    return null;
  }

  return (
    <>
      <Modal isOpen={true}>
        {isContributionEditorState(state) && (
          <ContributionEditorModal
            loading={isRefetching}
            onPostSaved={(post: PostType, postedSlug: string) => {
              if (isNewThread(state)) {
                setRefetching(true);
                // We can't do update the cache here because we don't know
                // which random identity will have been assigned by the server.
                refetchBoardActivity({ slug: postedSlug }).then(() => {
                  onClose();
                  if (postedSlug != state.boardSlug) {
                    getLinkToBoard(postedSlug).onClick?.();
                  }
                  setRefetching(false);
                });
                return;
              }
              if (isEditContribution(state)) {
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
        onCloseModal={onCloseModal}
        onSubmit={onSubmit}
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
  ReturnedComponent.displayName = `${
    WrappedComponent.displayName || WrappedComponent.name
  }_withEditors`;
  return ReturnedComponent;
};

export const useThreadEditors = () => {
  const { slug, threadId } = usePageDetails();
  const dispatch = useEditorsDispatch();

  if (!slug || !threadId) {
    throw new Error("Thread editors can only be used on thread pages.");
  }

  // TODO: use object argument instead of simple arguments
  const onNewComment = React.useCallback(
    (replyToContributionId: string, replyToCommentId: string | null) => {
      dispatch({
        type: EditorActions.NEW_COMMENT,
        payload: {
          boardSlug: slug,
          threadId,
          replyToContributionId,
          replyToCommentId,
        },
      });
    },
    [slug, threadId, dispatch]
  );

  const onNewContribution = React.useCallback(
    (replyToContributionId: string) => {
      dispatch({
        type: EditorActions.NEW_CONTRIBUTION,
        payload: {
          boardSlug: slug,
          threadId,
          replyToContributionId,
        },
      });
    },
    [slug, threadId, dispatch]
  );

  const onEditContribution = React.useCallback(
    (editContribution: PostType) => {
      dispatch({
        type: EditorActions.EDIT_TAGS,
        payload: {
          boardSlug: slug,
          threadId,
          contributionId: editContribution.postId,
        },
      });
    },
    [slug, threadId, dispatch]
  );

  return {
    onNewComment,
    onNewContribution,
    onEditContribution,
  };
};
