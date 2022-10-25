import {
  PostData,
  PostType,
  TagsType as ServerTagsType,
  ThreadType,
} from "types/Types";
import { PostEditor, toast } from "@bobaboard/ui-components";
import {
  THREAD_VIEW_OPTIONS,
  getViewIdFromName,
  processTags,
  useThreadDetails,
} from "./utils";
import {
  isContributionEditorState,
  isEditContribution,
  isNewThread,
} from "./types";

import React from "react";
import { createPost } from "utils/queries/post";
import { createThread } from "utils/queries/thread";
import debug from "debug";
import { editPost } from "utils/queries/post";
import { useAuth } from "components/Auth";
import { useEditorsState } from "./EditorsContext";
import { useMutation } from "react-query";
import { useRealmBoards } from "contexts/RealmContext";

const log = debug("bobafrontend:postEditor-log");
const error = debug("bobafrontend:postEditor-error");

const ContributionEditorModal: React.FC<PostEditorModalProps> = (props) => {
  const editorRef = React.createRef<{ focus: () => void }>();
  const hasFocused = React.useRef<boolean>(false);
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
    accessories,
  } = useThreadDetails(state);
  const [isPostLoading, setPostLoading] = React.useState(false);
  const { isLoggedIn } = useAuth();
  const boards = useRealmBoards();
  const currentBoard = boards.find((board) => state.boardId == board.id);

  const { mutate: postContribution } = useMutation<
    PostType | ThreadType,
    unknown,
    {
      boardId: string;
      replyToPostId: string | null;
      postData: PostData;
    }
  >(
    ({ boardId, replyToPostId, postData }) => {
      // Choose the endpoint according to the provided data.
      // If there's no post to reply to, then it's a new thread.
      // Else, it belongs as a contribution to that post.
      if (!replyToPostId) {
        return createThread(boardId, postData);
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
      onSuccess: (data: PostType | ThreadType, { boardId }) => {
        log(`Received post data after save:`);
        log(data);
        setPostLoading(false);
        if (!(data as any).posts) {
          props.onPostSaved(data as PostType, boardId);
        } else {
          props.onPostSaved((data as ThreadType).posts[0], boardId);
        }
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
    if (hasFocused.current || !editorRef.current) {
      return;
    }
    setTimeout(() => {
      editorRef.current?.focus();
      hasFocused.current = true;
    }, 100);
  }, [editorRef, hasFocused]);

  const allBoards = React.useMemo(
    () =>
      boards
        .map((data) => {
          return {
            slug: data.slug,
            avatar: data.avatarUrl,
            color: data.accentColor,
          };
        })
        .sort((b1, b2) => b1.slug.localeCompare(b2.slug)),
    [boards]
  );

  if (!isLoggedIn || !userIdentity) {
    return <div />;
  }

  const ownerSecretIdentity = isEditContribution(state)
    ? editingContribution?.secretIdentity
    : secretIdentity;
  const ownerPersonalIdentity = isEditContribution(state)
    ? editingContribution?.userIdentity
    : userIdentity;
  return (
    <div className="editor">
      <PostEditor
        ref={editorRef}
        initialText={editingContribution?.content}
        initialTags={editingContribution?.tags}
        secretIdentity={ownerSecretIdentity}
        // TODO: the user identity will be null if the identity of the OP isn't
        // known to the person editing.
        // @ts-expect-error
        userIdentity={ownerPersonalIdentity}
        additionalIdentities={additionalIdentities}
        accessories={
          ownerSecretIdentity || !accessories?.length ? undefined : accessories
        }
        viewOptions={isNewThread(state) ? THREAD_VIEW_OPTIONS : undefined}
        loading={isPostLoading || props.loading}
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
              accessoryId,
              viewOptionName,
              // TODO[realms]: this needs to be changed to be a board id.
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
                boardId: postedBoardSlug
                  ? boards.find((board) => board.slug == postedBoardSlug)!.id
                  : state.boardId,
                replyToPostId: parentContribution?.postId || null,
                postData: {
                  content: text,
                  forceAnonymous: false,
                  defaultView: getViewIdFromName(viewOptionName),
                  identityId,
                  accessoryId,
                  ...processedTags,
                },
              });
            }
          );
        }}
        onCancel={props.onCancel}
        initialBoard={{
          slug: currentBoard!.slug,
          color: currentBoard!.accentColor,
          avatar: currentBoard!.avatarUrl,
        }}
        availableBoards={isNewThread(state) ? allBoards : undefined}
      />
      <style jsx>{`
        .editor {
          display: flex;
          justify-content: center;
          padding: 0 15px 15px;
        }
      `}</style>
    </div>
  );
};

export interface PostEditorModalProps {
  onCancel: (empty: boolean) => void;
  onPostSaved: (post: PostType, boardId?: string) => void;
  loading?: boolean;
}

export default ContributionEditorModal;
