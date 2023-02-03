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
import { useCurrentRealmBoardId, useRealmBoards } from "contexts/RealmContext";

import CommentEditorModal from "./CommentEditorModal";
import ContributionEditorModal from "./ContributionEditorModal";
import React from "react";
import { addCommentInCache } from "cache/comment";
import debug from "debug";
import { useAuth } from "components/Auth";
import { useCachedLinks } from "../hooks/useCachedLinks";
import { usePageDetails } from "utils/router-utils";
import { usePreventPageChange } from "components/hooks/usePreventPageChange";
import { useQueryClient } from "react-query";
import { useRefetchBoardActivity } from "queries/board-feed";
import { useRouter } from "next/router";

const log = debug("bobafrontend:editors:withEditors-log");
// log.enabled = true;

const Editors = () => {
  const { isLoggedIn, isPending: isAuthPending } = useAuth();
  const { getLinkToBoard } = useCachedLinks();
  const queryClient = useQueryClient();
  const [isMinimized, setMinimized] = React.useState(false);
  const dispatch = useEditorsDispatch();
  const onClose = React.useCallback(() => {
    dispatch({ type: EditorActions.CLOSE, payload: {} });
    setMinimized(false);
  }, [dispatch]);
  const state = useEditorsState();
  const [askConfirmation, setAskConfirmation] = React.useState(false);
  const [navigationUrl, setNavigationUrl] = React.useState("");
  const [historyScrollPosition, setHistoryScrollPosition] = React.useState({
    x: 0,
    y: 0,
  });
  const [historyNavigation, setHistoryNavigation] = React.useState(false);
  const onCancel = React.useCallback(
    (empty) => {
      setNavigationUrl("");
      empty ? onClose() : setAskConfirmation(true);
    },
    [onClose, setAskConfirmation, setNavigationUrl]
  );
  const onCloseModal = React.useCallback(() => {
    setAskConfirmation(false);
    // This doesn't work properly if the user hit forward instead of back,
    // but there is not an easy solution for distinguishing the two so I don't think it's worth trying to fix right now
    if (historyNavigation) {
      history.forward();
    }
    setHistoryScrollPosition({ x: 0, y: 0 });
    setHistoryNavigation(false);
  }, [
    setAskConfirmation,
    historyNavigation,
    setHistoryScrollPosition,
    setHistoryNavigation,
  ]);
  const router = useRouter();
  const onSubmit = React.useCallback(() => {
    log("onSubmit triggered");
    setAskConfirmation(false);
    onClose();
    log("navigationUrl", navigationUrl);
    if (navigationUrl) {
      router.push(navigationUrl);
      if (
        historyNavigation &&
        (historyScrollPosition.x > 0 || historyScrollPosition.y > 0)
      ) {
        const { x, y } = historyScrollPosition;
        window.scrollTo(x, y);
        log("scrolled to", historyScrollPosition);
      }
    }
    setNavigationUrl("");
    setHistoryNavigation(false);
  }, [
    onClose,
    setAskConfirmation,
    navigationUrl,
    router,
    historyScrollPosition,
    historyNavigation,
  ]);
  const onNavigation = React.useCallback(
    ({
      url,
      historyNavigation,
      scrollPosition,
    }: {
      url: string;
      historyNavigation: boolean;
      scrollPosition?: { x: number; y: number };
    }) => {
      setAskConfirmation(true);
      setNavigationUrl(url);
      setHistoryNavigation(historyNavigation);
      if (scrollPosition) {
        setHistoryScrollPosition(scrollPosition);
      }
    },
    [
      setAskConfirmation,
      setNavigationUrl,
      setHistoryScrollPosition,
      setHistoryNavigation,
    ]
  );
  usePreventPageChange(() => state.isOpen, onNavigation);
  const refetchBoardActivity = useRefetchBoardActivity();
  const [isRefetching, setRefetching] = React.useState(false);
  const boards = useRealmBoards();
  const [empty, setEmpty] = React.useState(true);
  const onMinimize = () => {
    if (isMinimized) {
      document.body.style.overflow = "hidden";
      // These were your TODOs from wherever exactly I stole this code from
      // TODO: this is bad and horrible (we should not use query selector)
      const layoutNode = document.querySelector(".layout") as HTMLDivElement;
      if (layoutNode) {
        layoutNode.style.overflow = "hidden";
      }
    } else {
      document.body.style.overflow = "";
      // TODO: this is bad and horrible (we should not use query selector)
      const layoutNode = document.querySelector(".layout") as HTMLDivElement;
      if (layoutNode) {
        layoutNode.style.overflow = "";
      }
    }
    setMinimized(!isMinimized);
  };

  if (!isLoggedIn || isAuthPending || !state.isOpen) {
    return null;
  }

  return (
    <>
      <Modal
        isOpen={true}
        isMinimized={isMinimized}
        onMinimize={onMinimize}
        minimizable={!isNewThread(state)}
        onRequestClose={() => onCancel(empty)}
      >
        {isContributionEditorState(state) && (
          <ContributionEditorModal
            loading={isRefetching}
            onPostSaved={(
              post: PostType,
              postedBoardId: string | undefined
            ) => {
              if (isEditContribution(state)) {
                setPostTagsInCache(queryClient, {
                  threadId: state.threadId,
                  postId: post.postId,
                  boardId: state.boardId,
                  tags: post.tags,
                });
                onClose();
                return;
              }
              const postedBoard = boards.find(
                (board) => board.id == postedBoardId
              );
              if (!postedBoard) {
                toast.error(
                  `The board with id ${postedBoardId} does not exist.`
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
                    getLinkToBoard(postedBoard.slug).onClick?.();
                  }
                  setRefetching(false);
                });
                return;
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
            onIsEmptyChange={setEmpty}
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
            onIsEmptyChange={setEmpty}
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
  const boardId = useCurrentRealmBoardId({ boardSlug: slug });

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
