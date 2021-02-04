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
        boardSlug: string;
      };
    }
  | {
      type: EditorActions.NEW_CONTRIBUTION;
      payload: {
        boardSlug: string;
        threadId: string;
        replyToContributionId: string;
      };
    }
  | {
      type: EditorActions.NEW_COMMENT;
      payload: {
        boardSlug: string;
        threadId: string;
        replyToContributionId: string;
        replyToCommentId: string | null;
      };
    }
  | {
      type: EditorActions.EDIT_TAGS;
      payload: {
        boardSlug: string;
        threadId: string;
        contributionId: string;
      };
    }
  | {
      type: EditorActions.CLOSE;
      payload: {};
    };

export interface ClosedEditorState {
  isOpen: false;
}

export interface NewThreadState {
  isOpen: true;
  boardSlug: string;
  threadId: null;
}

export interface NewContributionState {
  isOpen: true;
  boardSlug: string;
  threadId: string;
  newContribution: {
    replyToContributionId: string;
  };
}

export interface EditContributionState {
  isOpen: true;
  boardSlug: string;
  threadId: string;
  editContributionId: string;
}

export interface NewCommentState {
  isOpen: true;
  boardSlug: string;
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

export const isEditContribution = (
  state: EditorState
): state is EditContributionState => {
  return "editContributionId" in state;
};
