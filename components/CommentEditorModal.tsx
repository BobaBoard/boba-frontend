import React from "react";
// @ts-ignore
import { CommentEditor, Modal } from "@bobaboard/ui-components";
import axios from "axios";

const CommentEditorModal: React.FC<CommentEditorModalProps> = (props) => {
  const [isCommentLoading, setCommentLoading] = React.useState(false);

  return (
    <Modal isOpen={props.isOpen}>
      <div className="editor">
        <CommentEditor
          secretIdentity={props.secretIdentity}
          userIdentity={props.userIdentity}
          loading={isCommentLoading}
          onSubmit={(text: string) => {
            setCommentLoading(true);
            axios
              .post(props.submitUrl, {
                content: text,
                forceAnonymous: false,
              })
              .then((response) => {
                props.onCommentSaved({
                  createdTime: "at some point",
                  content: text,
                  secretIdentity: props.secretIdentity,
                  userIdentity: props.userIdentity,
                });
                setCommentLoading(false);
              });
          }}
          onCancel={() => props.onCloseModal()}
          centered
          focus={props.isOpen}
        />
      </div>
    </Modal>
  );
};

export interface CommentEditorModalProps {
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
  onCommentSaved: (comment: any) => void;
  submitUrl: string;
}

export default CommentEditorModal;
