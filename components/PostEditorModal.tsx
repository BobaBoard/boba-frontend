import React from "react";
// @ts-ignore
import { PostEditor, Modal } from "@bobaboard/ui-components";
import { useAuth } from "./Auth";
import axios from "axios";
import firebase from "firebase/app";
import { v4 as uuidv4 } from "uuid";

const PostEditorModal: React.FC<PostEditorModalProps> = (props) => {
  const [isPostLoading, setPostLoading] = React.useState(false);
  const { isLoggedIn } = useAuth();

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
              axios
                .post(props.submitUrl, {
                  content: text,
                  large,
                  forceAnonymous: false,
                  whisperTags: tags,
                })
                .then((response) => {
                  props.onPostSaved({
                    createdTime: "1 minute ago",
                    text,
                    secretIdentity: props.secretIdentity,
                    userIdentity: props.userIdentity,
                    options: {
                      wide: large,
                    },
                    newPost: true,
                  });
                  setPostLoading(false);
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
  // TODO: add post type
  onPostSaved: (post: any) => void;
  submitUrl: string;
  uploadBaseUrl: string;
}

export default PostEditorModal;
