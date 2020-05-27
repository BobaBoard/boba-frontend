import React from "react";
// @ts-ignore
import { PostEditor, Modal } from "@bobaboard/ui-components";

const PostEditorModal: React.FC<PostEditorModalProps> = (props) => {
  const [isPostLoading, setPostLoading] = React.useState(false);
  return (
    <Modal isOpen={props.isOpen}>
      <PostEditor
        secretIdentity={props.secretIdentity}
        userIdentity={props.userIdentity}
        loading={isPostLoading}
        onSubmit={({ text, large }: { text: string; large: boolean }) => {
          setTimeout(() => {
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
          }, 3000);
          setPostLoading(true);
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
