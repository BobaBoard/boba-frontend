import React from "react";
// @ts-ignore
import { PostEditor, Modal, toast } from "@bobaboard/ui-components";
import { useAuth } from "./Auth";
import { useMutation } from "react-query";
import debug from "debug";
import firebase from "firebase/app";
import { v4 as uuidv4 } from "uuid";
import { createPost } from "../utils/queries";
import { PostData, PostType } from "../types/Types";

const log = debug("bobafrontend:postEditor-log");
const error = debug("bobafrontend:postEditor-error");

const PostEditorModal: React.FC<PostEditorModalProps> = (props) => {
  const [isPostLoading, setPostLoading] = React.useState(false);
  const { isLoggedIn } = useAuth();

  const [postContribution] = useMutation(
    ({
      slug,
      replyToPostId,
      postData: { content, large, forceAnonymous, whisperTags },
    }: {
      slug: string;
      replyToPostId: string | null;
      postData: PostData;
    }) =>
      createPost(slug, replyToPostId, {
        content,
        large,
        forceAnonymous,
        whisperTags,
      }),
    {
      onError: (serverError: Error, { replyToPostId }) => {
        toast.error("Error while creating new post.");
        error(`Error while answering to post ${replyToPostId}:`);
        error(serverError);
      },
      onSuccess: (data: PostType) => {
        log(`Received post data after save:`);
        log(data);
        props.onPostSaved(data);
        setPostLoading(false);
      },
    }
  );

  if (!isLoggedIn) {
    return <div />;
  }

  return (
    <Modal isOpen={props.isOpen}>
      <PostEditor
        // @ts-ignore
        secretIdentity={props.secretIdentity}
        userIdentity={props.userIdentity}
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
        onSubmit={(textPromise: Promise<{ text: string; large: boolean }>) => {
          setPostLoading(true);
          textPromise.then(
            ({
              text,
              large,
              tags,
            }: {
              text: string;
              large: boolean;
              tags: string[];
            }) => {
              postContribution({
                slug: props.slug,
                replyToPostId: props.replyToPostId,
                postData: {
                  content: text,
                  large,
                  forceAnonymous: false,
                  whisperTags: tags,
                },
              });
            }
          );
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
  onPostSaved: (post: PostType) => void;
  replyToPostId: string | null;
  slug: string;
  uploadBaseUrl: string;
}

export default PostEditorModal;
