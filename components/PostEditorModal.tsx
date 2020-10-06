import React from "react";
// @ts-ignore
import { PostEditor, Modal, toast } from "@bobaboard/ui-components";
import { useAuth } from "./Auth";
import { useMutation } from "react-query";
import debug from "debug";
import firebase from "firebase/app";
import { v4 as uuidv4 } from "uuid";
import { createPost, createThread } from "../utils/queries";
import { PostData, PostType, ThreadType } from "../types/Types";

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

const PostEditorModal: React.FC<PostEditorModalProps> = (props) => {
  const editorRef = React.createRef<{ focus: () => void }>();
  const [isPostLoading, setPostLoading] = React.useState(false);
  const { isLoggedIn } = useAuth();

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

  if (!isLoggedIn) {
    return <div />;
  }

  return (
    <Modal isOpen={props.isOpen}>
      <PostEditor
        ref={editorRef}
        secretIdentity={props.secretIdentity}
        userIdentity={props.userIdentity}
        additionalIdentities={props.additionalIdentities}
        viewOptions={props.replyToPostId ? undefined : THREAD_VIEW_OPTIONS}
        loading={isPostLoading}
        onImageUploadRequest={(src: string) => {
          return new Promise<string>((onSuccess, onReject) => {
            // Do not upload tenor stuff
            if (src.startsWith("https://media.tenor.com/")) {
              onSuccess(src);
              return;
            }
            // Upload base 64 images
            if (src.startsWith("data:image")) {
              const ref = firebase
                .storage()
                .ref(props.uploadBaseUrl)
                .child(uuidv4());

              ref
                .putString(src, "data_url")
                .on(firebase.storage.TaskEvent.STATE_CHANGED, {
                  complete: () => {
                    ref.getDownloadURL().then((url) => onSuccess(url));
                  },
                  next: () => {},
                  error: (e) => {
                    console.log(e);
                    onReject(e);
                  },
                });
              return;
            }
            // else, for now, let's just swap it with the Onceler.
            onSuccess(
              "https://pbs.twimg.com/media/EY-RqiyUwAAfgzd?format=png&name=small"
            );
          });
        }}
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
                whisperTags:
                  tags
                    ?.filter(
                      (tag) =>
                        !tag.indexable && !tag.category && !tag.contentWarning
                    )
                    .map((tag) => tag.name) || [],
                indexTags: tags
                  .filter((tag) => tag.indexable)
                  .map((tag) => tag.name),
                contentWarnings: tags
                  .filter((tag) => tag.contentWarning)
                  .map((tag) => tag.name),
                categoryTags: tags
                  .filter((tag) => tag.category)
                  .map((tag) => tag.name),
              },
            });
          });
        }}
        onCancel={() => props.onCloseModal()}
        centered
      />
    </Modal>
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
