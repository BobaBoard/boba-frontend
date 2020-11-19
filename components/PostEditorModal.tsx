import React from "react";
import {
  PostEditor,
  Modal,
  ModalWithButtons,
  toast,
} from "@bobaboard/ui-components";
import { useAuth } from "./Auth";
import { useMutation } from "react-query";
import { createPost, createThread } from "../utils/queries";
import { editPost } from "../utils/queries/post";
import { createImageUploadPromise } from "../utils/image-upload";
import {
  PostData,
  PostType,
  ThreadType,
  TagsType as ServerTagsType,
} from "../types/Types";
import { TagsType } from "@bobaboard/ui-components/dist/types";
import { usePreventPageChange } from "./hooks/usePreventPageChange";

import debug from "debug";
const log = debug("bobafrontend:postEditor-log");
const error = debug("bobafrontend:postEditor-error");

const THREAD_VIEW_OPTIONS = [
  { name: "Thread", id: "thread" },
  { name: "Gallery", id: "gallery" },
  { name: "Timeline", id: "timeline" },
];

const getViewIdFromName = (viewName?: string) => {
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

const processTags = (tags: TagsType[]): ServerTagsType => {
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

const PostEditorModal: React.FC<PostEditorModalProps> = (props) => {
  const editorRef = React.createRef<{ focus: () => void }>();
  const [isPostLoading, setPostLoading] = React.useState(false);
  const [askConfirmation, setAskConfirmation] = React.useState(false);
  const { isLoggedIn } = useAuth();
  usePreventPageChange(() => props.isOpen, props.onCloseModal, [props.isOpen]);

  const [postContribution] = useMutation<
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
      onSuccess: (data: PostType | ThreadType, { replyToPostId }) => {
        log(`Received post data after save:`);
        log(data);
        if (!(data as any).posts) {
          props.onPostSaved(data as PostType);
        } else {
          props.onPostSaved((data as ThreadType).posts[0]);
        }
        setPostLoading(false);
      },
    }
  );

  const [editContribution] = useMutation<
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
        if (!(data as any).posts) {
          props.onPostSaved(data as PostType);
        } else {
          props.onPostSaved((data as ThreadType).posts[0]);
        }
        setPostLoading(false);
      },
    }
  );

  React.useEffect(() => {
    if (props.isOpen) {
      // TODO: this request animation frame here is a bit hackish, but it won't
      // work without it.
      requestAnimationFrame(() => {
        editorRef.current?.focus();
      });
    }
  }, [props.isOpen]);

  if (!isLoggedIn) {
    return <div />;
  }

  return (
    <>
      <Modal isOpen={props.isOpen}>
        <PostEditor
          ref={editorRef}
          initialText={props.editPost?.content}
          initialTags={props.editPost?.tags}
          secretIdentity={props.secretIdentity}
          userIdentity={props.userIdentity}
          additionalIdentities={props.additionalIdentities}
          viewOptions={
            props.replyToPostId || props.editPost
              ? undefined
              : THREAD_VIEW_OPTIONS
          }
          loading={isPostLoading}
          suggestedCategories={props?.suggestedCategories || []}
          onImageUploadRequest={(src: string) =>
            createImageUploadPromise({
              imageData: src,
              baseUrl: props.uploadBaseUrl,
            })
          }
          editableSections={
            props.editPost
              ? {
                  tags: true,
                }
              : undefined
          }
          onSubmit={(textPromise) => {
            setPostLoading(true);
            textPromise.then(({ text, tags, identityId, viewOptionName }) => {
              const processedTags = processTags(tags);

              if (props.editPost) {
                editContribution({
                  postId: props.editPost.postId,
                  tags: processedTags,
                });
                return;
              }
              log(identityId);
              postContribution({
                slug: props.slug,
                replyToPostId: props.replyToPostId,
                postData: {
                  content: text,
                  forceAnonymous: false,
                  defaultView: getViewIdFromName(viewOptionName),
                  identityId,
                  ...processedTags,
                },
              });
            });
          }}
          onCancel={(empty) =>
            empty ? props.onCloseModal() : setAskConfirmation(true)
          }
          centered
        />
      </Modal>
      <ModalWithButtons
        isOpen={askConfirmation}
        onCloseModal={() => setAskConfirmation(false)}
        onSubmit={() => {
          setAskConfirmation(false);
          props.onCloseModal();
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

export interface PostEditorModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
  secretIdentity?: {
    avatar: string;
    name: string;
  };
  userIdentity: {
    avatar: string;
    name: string;
  };
  additionalIdentities?: {
    id: string;
    avatar: string;
    name: string;
  }[];
  onPostSaved: (post: PostType) => void;
  replyToPostId: string | null;
  editPost?: PostType | null;
  slug: string;
  uploadBaseUrl: string;
  suggestedCategories?: string[];
}

export default PostEditorModal;
