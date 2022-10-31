export enum EditorActions {
  "NEW_THREAD",
  "NEW_CONTRIBUTION",
  "NEW_COMMENT",
  "EDIT_TAGS",
  "CLOSE",
}

export type EditorActionsDispatch =
  | {
      type: EditorActions.NEW_THREAD;
      payload: {
        boardId: string;
      };
    }
  | {
      type: EditorActions.NEW_CONTRIBUTION;
      payload: {
        boardId: string;
        threadId: string;
        replyToContributionId: string;
      };
    }
  | {
      type: EditorActions.NEW_COMMENT;
      payload: {
        boardId: string;
        threadId: string;
        replyToContributionId: string;
        replyToCommentId: string | null;
      };
    }
  | {
      type: EditorActions.EDIT_TAGS;
      payload: {
        boardId: string;
        threadId: string;
        contributionId: string;
      };
    }
  | {
      type: EditorActions.CLOSE;
      payload: Record<string, never>;
    };

export interface ClosedEditorState {
  isOpen: false;
}

export interface NewThreadState {
  isOpen: true;
  boardId: string;
  threadId: null;
}

export interface NewContributionState {
  isOpen: true;
  boardId: string;
  threadId: string;
  newContribution: {
    replyToContributionId: string;
  };
}

export interface EditContributionState {
  isOpen: true;
  boardId: string;
  threadId: string;
  editContributionId: string;
}

export interface NewCommentState {
  isOpen: true;
  boardId: string;
  threadId: string;
  newComment: {
    replyToContributionId: string;
    replyToCommentId: string | null;
  };
}

export type EditorState =
  | ClosedEditorState
  | NewThreadState
  | NewContributionState
  | EditContributionState
  | NewCommentState;

export const isContributionEditorState = (
  state: EditorState
): state is NewContributionState | NewThreadState | EditContributionState => {
  return state.isOpen && !("newComment" in state);
};

export const isCommentEditorState = (
  state: EditorState
): state is NewCommentState => {
  return state.isOpen && !isContributionEditorState(state);
};

export const isNewThread = (state: EditorState): state is NewThreadState => {
  return (
    state.isOpen && isContributionEditorState(state) && state.threadId === null
  );
};

export const isReplyContribution = (
  state: EditorState
): state is NewContributionState => {
  return (
    state.isOpen &&
    isContributionEditorState(state) &&
    "newContribution" in state
  );
};

export const isEditContribution = (
  state: EditorState
): state is EditContributionState => {
  return "editContributionId" in state;
};
