import { EditorActions, EditorActionsDispatch, EditorState } from "./types";

import React from "react";

const editorsReducer = (
  state: EditorState,
  action: EditorActionsDispatch
): EditorState => {
  if (action.type === EditorActions.CLOSE) {
    return {
      isOpen: false,
    };
  }
  if (state.isOpen) {
    if (action.type == EditorActions.UPDATE_BOARD) {
      return {
        ...state,
        boardId: action.payload.boardId,
      };
    }
    // Do not change state if the editor is already open.
    return state;
  }
  switch (action.type) {
    case EditorActions.NEW_THREAD:
      return {
        isOpen: true,
        boardId: action.payload.boardId,
        threadId: null,
      };
    case EditorActions.NEW_CONTRIBUTION:
      return {
        isOpen: true,
        boardId: action.payload.boardId,
        threadId: action.payload.threadId,
        newContribution: {
          replyToContributionId: action.payload.replyToContributionId,
        },
      };
    case EditorActions.NEW_COMMENT:
      return {
        isOpen: true,
        boardId: action.payload.boardId,
        threadId: action.payload.threadId,
        newComment: {
          replyToContributionId: action.payload.replyToContributionId,
          replyToCommentId: action.payload.replyToCommentId,
        },
      };
    case EditorActions.EDIT_TAGS:
      return {
        isOpen: true,
        boardId: action.payload.boardId,
        threadId: action.payload.threadId,
        editContributionId: action.payload.contributionId,
      };
    default:
      throw new Error("Invalid state change for EditorsContext");
  }
};

const EditorsStateContext = React.createContext<EditorState | undefined>(
  undefined
);
const EditorsDispatchContext = React.createContext<
  ((action: EditorActionsDispatch) => void) | undefined
>(undefined);
function EditorsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(editorsReducer, { isOpen: false });
  return (
    <EditorsStateContext.Provider value={state}>
      <EditorsDispatchContext.Provider value={dispatch}>
        {children}
      </EditorsDispatchContext.Provider>
    </EditorsStateContext.Provider>
  );
}

function useEditorsState() {
  const context = React.useContext(EditorsStateContext);
  if (context === undefined) {
    throw new Error("useEditorsState must be used within a EditorsProvider");
  }
  return context;
}

function useEditorsDispatch() {
  const context = React.useContext(EditorsDispatchContext);
  if (context === undefined) {
    throw new Error("useEditorsDispatch must be used within a EditorsProvider");
  }
  return context;
}

export { EditorsProvider, useEditorsState, useEditorsDispatch, EditorActions };
