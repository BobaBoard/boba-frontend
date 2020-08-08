import React from "react";
// @ts-ignore
import { CommentChainEditor, Modal, toast } from "@bobaboard/ui-components";
import { useAuth } from "./Auth";
import { useMutation } from "react-query";
import { CommentType, CommentData } from "../types/Types";
import { createComment, createCommentChain } from "../utils/queries";
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
        props.onCommentsSaved([data]);
        setCommentLoading(false);
      },
    }
  );

  const [postCommentChain] = useMutation(
    ({
      replyToPostId,
      commentData,
    }: {
      replyToPostId: string | null;
      commentData: CommentData[];
    }) => createCommentChain({ replyToPostId, commentData }),
    {
      onError: (serverError: Error, { replyToPostId }) => {
        toast.error("Error while creating new comment.");
        error(`Error while commenting on post ${replyToPostId}:`);
        error(serverError);
      },
      onSuccess: (data: CommentType[]) => {
        log(`Received comment data after save:`);
        log(data);
        props.onCommentsSaved(data);
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
        <CommentChainEditor
          secretIdentity={props.secretIdentity}
          userIdentity={props.userIdentity}
          loading={isCommentLoading}
          onSubmit={(text: string[]) => {
            if (!props.replyTo) {
              return;
            }
            setCommentLoading(true);
            if (text.length > 1) {
              postCommentChain({
                replyToPostId: props.replyTo,
                commentData: text.map((t) => ({
                  content: t,
                  forceAnonymous: false,
                })),
              });
            } else {
              postComment({
                replyToPostId: props.replyTo,
                commentData: {
                  content: text[0],
                  forceAnonymous: false,
                },
              });
            }
          }}
          onCancel={() => props.onCloseModal()}
        />
      </div>
      <style jsx>{`
        .editor {
          display: flex;
          justify-content: center;
          padding: 15px;
        }
      `}</style>
    </Modal>
  );
};

export interface CommentEditorModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
  secretIdentity?: {
    avatar: string;
    name: string;
  };
  userIdentity?: {
    avatar: string;
    name: string;
  };
  onCommentsSaved: (comments: CommentType[]) => void;
  replyTo: string | null;
}

export default CommentEditorModal;
