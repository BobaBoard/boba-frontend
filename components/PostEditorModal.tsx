import React from "react";
// @ts-ignore
import { PostEditor, Modal } from "@bobaboard/ui-components";
import axios from "axios";
import { useRouter } from "next/router";

const PostEditorModal: React.FC<PostEditorModalProps> = (props) => {
  const [isPostLoading, setPostLoading] = React.useState(false);
  const router = useRouter();
  console.log(router);

  return (
    <Modal isOpen={props.isOpen}>
      <PostEditor
        secretIdentity={props.secretIdentity}
        userIdentity={props.userIdentity}
        loading={isPostLoading}
        onImageUploadRequest={(src: string) => {
          return new Promise<string>((onSuccess) => {
            setTimeout(() => {
              console.log(src);
              onSuccess(
                "https://pbs.twimg.com/media/EY-RqiyUwAAfgzd?format=png&name=small"
              );
            }, 1000);
          });
        }}
        onSubmit={(textPromise) => {
          setPostLoading(true);
          textPromise.then(({ text, large }) => {
            axios
              .post(`/posts/3db477e0-57ed-491d-ba11-b3a0110b59b0/contribute`, {
                content: text,
                forceAnonymous: false,
              })
              .then((response) => {
                console.log(response.data);
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
  secretIdentity: {
    avatar: string;
    name: string;
  };
  userIdentity: {
    avatar: string;
    name: string;
  };
  // TODO: add post type
  onPostSaved: (post: any) => void;
}

export default PostEditorModal;
