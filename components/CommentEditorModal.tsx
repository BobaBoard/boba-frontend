import React from "react";
// @ts-ignore
import { CommentEditor, Modal, toast } from "@bobaboard/ui-components";
import { useAuth } from "./Auth";
import { useMutation } from "react-query";
import { CommentType, CommentData } from "../types/Types";
import { createComment } from "../utils/queries";
import debug from "debug";

const log = debug("bobafrontend:commentEditor-log");
const error = debug("bobafrontend:commentEditor-error");

const CommentEditorModal: React.FC<CommentEditorModalProps> = (props) => {
  const [isCommentLoading, setCommentLoading] = React.useState(false);
  const { isLoggedIn } = useAuth();

  const [postComment] = useMutation(
    ({
      replyToPostId,
      commentData,
    }: {
      replyToPostId: string | null;
      commentData: CommentData;
    }) => createComment({ replyToPostId, commentData }),
    {
      onError: (serverError: Error, { replyToPostId }) => {
        toast.error("Error while creating new comment.");
        error(`Error while commenting on post ${replyToPostId}:`);
        error(serverError);
      },
      onSuccess: (data: CommentType) => {
        log(`Received comment data after save:`);
        log(data);
        props.onCommentSaved(data);
        setCommentLoading(false);
      },
    }
  );

  if (!isLoggedIn) {
    return <div />;
  }

  return (
    <Modal isOpen={props.isOpen}>
      <div className="editor">
        <CommentEditor
          secretIdentity={props.secretIdentity}
          userIdentity={props.userIdentity}
          loading={isCommentLoading}
          onSubmit={(text: string) => {
            if (!props.replyTo) {
              return;
            }
            setCommentLoading(true);
            postComment({
              replyToPostId: props.replyTo,
              commentData: {
                content: text,
                forceAnonymous: false,
              },
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
  replyTo: string | null;
}

export default CommentEditorModal;
