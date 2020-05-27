import React from "react";
import { CommentEditor, Modal } from "@bobaboard/ui-components";

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
            setTimeout(() => {
              props.onCommentSaved({
                createdTime: "1 minute ago",
                content: text,
                secretIdentity: props.secretIdentity,
                userIdentity: props.userIdentity,
              });
              setCommentLoading(false);
            }, 3000);
            setCommentLoading(true);
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
}

export default CommentEditorModal;
