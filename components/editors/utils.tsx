import { TagsType as ServerTagsType } from "../../types/Types";
import { TagsType } from "@bobaboard/ui-components/dist/types";
import {
  ClosedEditorState,
  EditorState,
  isEditContribution,
  isNewThread,
} from "./types";
import { useThreadWithNull } from "components/thread/ThreadQueryHook";
import { useBoardContext } from "components/BoardContext";
import { useAuth } from "components/Auth";

export const THREAD_VIEW_OPTIONS = [
  { name: "Thread", id: "thread" },
  { name: "Gallery", id: "gallery" },
  { name: "Timeline", id: "timeline" },
];

export const getViewIdFromName = (viewName?: string) => {
  switch (viewName) {
    case "Timeline":
      return "timeline";
    case "Gallery":
      return "gallery";
    default:
    case "Thread":
      return "thread";
  }
};

export const processTags = (tags: TagsType[]): ServerTagsType => {
  return {
    whisperTags:
      tags
        ?.filter(
          (tag) => !tag.indexable && !tag.category && !tag.contentWarning
        )
        .map((tag) => tag.name) || [],
    indexTags: tags.filter((tag) => tag.indexable).map((tag) => tag.name),
    contentWarnings: tags
      .filter((tag) => tag.contentWarning)
      .map((tag) => tag.name),
    categoryTags: tags.filter((tag) => tag.category).map((tag) => tag.name),
  };
};

export const useThreadDetails = (
  state: Exclude<EditorState, ClosedEditorState>
) => {
  const { boardSlug, threadId } = state;
  const threadData = useThreadWithNull({
    slug: boardSlug,
    threadId: threadId || null,
    postId: isEditContribution(state)
      ? state.editContributionId
      : (state["newContribution"] || state["newComment"])
          ?.replyToContributionId || null,
  });
  const { boardsData } = useBoardContext();
  const { user } = useAuth();

  const currentBoardData = boardsData[boardSlug];
  const additionalIdentities =
    !threadData?.personalIdentity && currentBoardData?.postingIdentities
      ? currentBoardData.postingIdentities.map((identity) => ({
          ...identity,
          avatar: identity.avatarUrl,
        }))
      : undefined;

  return {
    additionalIdentities,
    parentContribution: isEditContribution(state)
      ? undefined
      : threadData.currentRoot,
    editingContribution: isEditContribution(state)
      ? threadData.currentRoot
      : undefined,
    suggestedCategories: isNewThread(state)
      ? currentBoardData.suggestedCategories
      : threadData.categories,
    userIdentity: user
      ? {
          name: user.username,
          avatar: user.avatarUrl,
        }
      : undefined,
    secretIdentity: threadData.personalIdentity,
  };
};
