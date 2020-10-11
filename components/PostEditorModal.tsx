import React from "react";
import {
  PostEditor,
  Modal,
  ModalWithButtons,
  toast,
} from "@bobaboard/ui-components";
import { useAuth } from "./Auth";
import { useMutation } from "react-query";
import debug from "debug";
import { createPost, createThread } from "../utils/queries";
import { createImageUploadPromise } from "../utils/image-upload";
import { PostData, PostType, ThreadType } from "../types/Types";
import { useBoardContext } from "./BoardContext";
import { TagsType } from "@bobaboard/ui-components/dist/types";
import { useRouter } from "next/router";

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

const processTags = (tags: TagsType[]) => {
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
  const { [props.slug]: boardData } = useBoardContext();
  const [isPostLoading, setPostLoading] = React.useState(false);
  const [askConfirmation, setAskConfirmation] = React.useState(false);
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const isCurrentlyOpen = React.useRef(props.isOpen);

  const [postContribution] = useMutation<
    PostType | ThreadType,
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

  React.useEffect(() => {
    if (props.isOpen) {
      // TODO: this request animation frame here is a bit hackish, but it won't
      // work without it.
      requestAnimationFrame(() => {
        editorRef.current?.focus();
      });
    }
  }, [props.isOpen]);

  React.useEffect(() => {
    isCurrentlyOpen.current = props.isOpen;
  }, [props.isOpen]);

  React.useEffect(() => {
    const unloadListener = (e: BeforeUnloadEvent) => {
      if (isCurrentlyOpen.current) {
        e.preventDefault();
        e.returnValue = true;
      }
    };
    router.beforePopState((state: any) => {
      console.log("pop");
      console.log(state);
      console.log(router);
      if (
        state.as == router.asPath ||
        !isCurrentlyOpen.current ||
        confirm("Do you want to go back?")
      ) {
        return true;
      }
      history.forward();
      return false;
    });
    window.addEventListener("beforeunload", unloadListener);
    return () => {
      window.removeEventListener("beforeunload", unloadListener);
    };
  }, []);

  if (!isLoggedIn) {
    return <div />;
  }

  return (
    <>
      <Modal isOpen={props.isOpen}>
        <PostEditor
          ref={editorRef}
          secretIdentity={props.secretIdentity}
          userIdentity={props.userIdentity}
          additionalIdentities={props.additionalIdentities}
          viewOptions={props.replyToPostId ? undefined : THREAD_VIEW_OPTIONS}
          loading={isPostLoading}
          suggestedCategories={boardData?.suggestedCategories || []}
          onImageUploadRequest={(src: string) =>
            createImageUploadPromise({
              imageData: src,
              baseUrl: props.uploadBaseUrl,
            })
          }
          onSubmit={(textPromise) => {
            setPostLoading(true);
            textPromise.then(({ text, tags, identityId, viewOptionName }) => {
              log(identityId);
              postContribution({
                slug: props.slug,
                replyToPostId: props.replyToPostId,
                postData: {
                  content: text,
                  forceAnonymous: false,
                  defaultView: getViewIdFromName(viewOptionName),
                  identityId,
                  ...processTags(tags),
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
  slug: string;
  uploadBaseUrl: string;
}

export default PostEditorModal;
