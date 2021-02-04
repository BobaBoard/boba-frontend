import React from "react";
import { PostEditor, toast } from "@bobaboard/ui-components";
import { useAuth } from "../Auth";
import { useMutation } from "react-query";
import { createPost, createThread } from "../../utils/queries";
import { editPost } from "../../utils/queries/post";
import {
  getViewIdFromName,
  processTags,
  THREAD_VIEW_OPTIONS,
  useThreadDetails,
} from "./utils";
import {
  isContributionEditorState,
  isEditContribution,
  isNewThread,
} from "./types";
import { useEditorsState } from "./EditorsContext";
import {
  PostData,
  PostType,
  ThreadType,
  TagsType as ServerTagsType,
} from "../../types/Types";

import debug from "debug";
import { useBoardContext } from "components/BoardContext";
const log = debug("bobafrontend:postEditor-log");
const error = debug("bobafrontend:postEditor-error");

const ContributionEditorModal: React.FC<PostEditorModalProps> = (props) => {
  const editorRef = React.createRef<{ focus: () => void }>();
  const state = useEditorsState();
  if (!isContributionEditorState(state)) {
    throw new Error(
      "ContributionEditorModal must only be rendered when the editor is open and a contribution is being edited."
    );
  }
  const {
    additionalIdentities,
    parentContribution,
    editingContribution,
    suggestedCategories,
    secretIdentity,
    userIdentity,
  } = useThreadDetails(state);
  const [isPostLoading, setPostLoading] = React.useState(false);
  const { isLoggedIn } = useAuth();
  const { boardsData } = useBoardContext();

  const { mutate: postContribution } = useMutation<
    PostType | ThreadType,
    unknown,
    {
      slug: string;
      replyToPostId: string | null;
      postData: PostData;
    }
  >(
    ({ slug, replyToPostId, postData }) => {
      // Choose the endpoint according to the provided data.
      // If there's no post to reply to, then it's a new thread.
      // Else, it belongs as a contribution to that post.
      if (!replyToPostId) {
        return createThread(slug, postData);
      } else {
        return createPost(replyToPostId, postData);
      }
    },
    {
      onError: (serverError: Error, { replyToPostId }) => {
        toast.error("Error while creating new post.");
        error(`Error while answering to post ${replyToPostId}:`);
        error(serverError);
        setPostLoading(false);
      },
      onSuccess: (data: PostType | ThreadType, { slug }) => {
        log(`Received post data after save:`);
        log(data);
        if (!(data as any).posts) {
          props.onPostSaved(data as PostType, slug);
        } else {
          props.onPostSaved((data as ThreadType).posts[0], slug);
        }
        setPostLoading(false);
      },
    }
  );

  const { mutate: editContribution } = useMutation<
    PostType,
    unknown,
    {
      postId: string;
      tags: ServerTagsType;
    }
  >(
    ({ postId, tags }) => {
      return editPost({ postId, tags });
    },
    {
      onError: (serverError: Error, { postId }) => {
        toast.error("Error while editing post.");
        error(`Error while editing post ${postId}:`);
        error(serverError);
        setPostLoading(false);
      },
      onSuccess: (data: PostType | ThreadType, { postId }) => {
        log(`Received post data after edit:`);
        log(data);
        setPostLoading(false);
        if (!(data as any).posts) {
          props.onPostSaved(data as PostType);
        } else {
          props.onPostSaved((data as ThreadType).posts[0]);
        }
      },
    }
  );

  React.useEffect(() => {
    // TODO: this request animation frame here is a bit hackish, but it won't
    // work without it.
    requestAnimationFrame(() => {
      editorRef.current?.focus();
    });
  }, []);

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

  if (!isLoggedIn) {
    return <div />;
  }

  return (
    <PostEditor
      ref={editorRef}
      initialText={editingContribution?.content}
      initialTags={editingContribution?.tags}
      secretIdentity={secretIdentity}
      userIdentity={userIdentity}
      additionalIdentities={additionalIdentities}
      viewOptions={isNewThread(state) ? THREAD_VIEW_OPTIONS : undefined}
      loading={isPostLoading}
      suggestedCategories={suggestedCategories || []}
      editableSections={
        isEditContribution(state)
          ? {
              tags: true,
            }
          : undefined
      }
      onSubmit={(textPromise) => {
        setPostLoading(true);
        textPromise.then(
          ({
            text,
            tags,
            identityId,
            viewOptionName,
            boardSlug: postedBoardSlug,
          }) => {
            const processedTags = processTags(tags);

            if (isEditContribution(state)) {
              editContribution({
                postId: editingContribution!.postId,
                tags: processedTags,
              });
              return;
            }
            log(identityId);
            postContribution({
              slug: postedBoardSlug ? postedBoardSlug : state.boardSlug,
              replyToPostId: parentContribution?.postId || null,
              postData: {
                content: text,
                forceAnonymous: false,
                defaultView: getViewIdFromName(viewOptionName),
                identityId,
                ...processedTags,
              },
            });
          }
        );
      }}
      onCancel={props.onCancel}
      centered
      initialBoard={state.boardSlug}
      availableBoards={isNewThread(state) ? allBoards : undefined}
    />
  );
};

export interface PostEditorModalProps {
  onCancel: (empty: boolean) => void;
  onPostSaved: (post: PostType, board?: string) => void;
}

export default ContributionEditorModal;
