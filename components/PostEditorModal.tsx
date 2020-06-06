import React from "react";
// @ts-ignore
import { PostEditor, Modal } from "@bobaboard/ui-components";
import axios from "axios";

const PostEditorModal: React.FC<PostEditorModalProps> = (props) => {
  const [isPostLoading, setPostLoading] = React.useState(false);

  return (
    <Modal isOpen={props.isOpen}>
      <PostEditor
        secretIdentity={props.secretIdentity}
        userIdentity={props.userIdentity}
        loading={isPostLoading}
        onImageUploadRequest={(src: string) => {
          return new Promise<string>((onSuccess) => {
            setTimeout(() => {
              onSuccess(
                "https://pbs.twimg.com/media/EY-RqiyUwAAfgzd?format=png&name=small"
              );
            }, 1000);
          });
        }}
        onSubmit={(textPromise: Promise<{ text: string; large: boolean }>) => {
          setPostLoading(true);
          textPromise.then(
            ({ text, large }: { text: string; large: boolean }) => {
              console.log(text, large);
              axios
                .post(props.submitUrl, {
                  content: text,
                  forceAnonymous: false,
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
}

export default PostEditorModal;
