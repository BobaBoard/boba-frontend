import { CommentType, PostType } from "types/Types";
import {
  EditorActions,
  EditorsProvider,
  useEditorsDispatch,
  useEditorsState,
} from "./EditorsContext";
import { Modal, ModalWithButtons, toast } from "@bobaboard/ui-components";
import { addPostInCache, setPostTagsInCache } from "cache/post";
import {
  isCommentEditorState,
  isContributionEditorState,
  isEditContribution,
  isNewThread,
} from "./types";
import { useRealmBoardId, useRealmBoards } from "contexts/RealmContext";

import CommentEditorModal from "./CommentEditorModal";
import ContributionEditorModal from "./ContributionEditorModal";
import React from "react";
import { addCommentInCache } from "cache/comment";
import { useAuth } from "components/Auth";
import { useCachedLinks } from "../hooks/useCachedLinks";
import { usePageDetails } from "utils/router-utils";
import { usePreventPageChange } from "components/hooks/usePreventPageChange";
import { useQueryClient } from "react-query";
import { useRefetchBoardActivity } from "queries/board-feed";

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
  const boards = useRealmBoards();
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
              const postedBoard = boards.find(
                (board) => board.slug == postedSlug
              );
              if (!postedBoard) {
                toast.error(
                  `The board with slug ${postedSlug} does not exist.`
                );
                return;
              }
              if (isNewThread(state)) {
                setRefetching(true);
                // We can't do update the cache here because we don't know
                // which random identity will have been assigned by the server.
                refetchBoardActivity({
                  boardId: postedBoard.id,
                }).then(() => {
                  onClose();
                  if (postedBoard.id !== state.boardId) {
                    getLinkToBoard(postedSlug).onClick?.();
                  }
                  setRefetching(false);
                });
                return;
              }
              if (isEditContribution(state)) {
                setPostTagsInCache(queryClient, {
                  threadId: state.threadId,
                  postId: post.postId,
                  boardId: postedSlug,
                  tags: post.tags,
                });
              } else {
                addPostInCache(queryClient, {
                  threadId: state.threadId,
                  post,
                  boardId: postedBoard.id,
                });
              }
              onClose();
            }}
            onCancel={onCancel}
          />
        )}
        {isCommentEditorState(state) && (
          <CommentEditorModal
            onCommentsSaved={(comments: CommentType[]) => {
              addCommentInCache(queryClient, {
                threadId: state.threadId,
                newComments: comments,
                boardId: state.boardId,
                replyTo: {
                  postId: state.newComment.replyToContributionId,
                  commentId: state.newComment.replyToCommentId,
                },
              });
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
  const boardId = useRealmBoardId({ boardSlug: slug, realmSlug: "v0" });

  if (!slug || !threadId) {
    throw new Error("Thread editors can only be used on thread pages.");
  }

  // TODO: use object argument instead of simple arguments
  const onNewComment = React.useCallback(
    (replyToContributionId: string, replyToCommentId: string | null) => {
      if (!boardId) {
        return;
      }
      dispatch({
        type: EditorActions.NEW_COMMENT,
        payload: {
          boardId,
          threadId,
          replyToContributionId,
          replyToCommentId,
        },
      });
    },
    [boardId, threadId, dispatch]
  );

  const onNewContribution = React.useCallback(
    (replyToContributionId: string) => {
      if (!boardId) {
        return;
      }
      dispatch({
        type: EditorActions.NEW_CONTRIBUTION,
        payload: {
          boardId,
          threadId,
          replyToContributionId,
        },
      });
    },
    [boardId, threadId, dispatch]
  );

  const onEditContribution = React.useCallback(
    (editContribution: PostType) => {
      if (!boardId) {
        return;
      }
      dispatch({
        type: EditorActions.EDIT_TAGS,
        payload: {
          boardId,
          threadId,
          contributionId: editContribution.postId,
        },
      });
    },
    [boardId, threadId, dispatch]
  );

  return {
    onNewComment,
    onNewContribution,
    onEditContribution,
  };
};
