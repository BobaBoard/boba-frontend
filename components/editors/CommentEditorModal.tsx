import React from "react";
// @ts-ignore
import {
  CommentChainEditor,
  Modal,
  ModalWithButtons,
  toast,
} from "@bobaboard/ui-components";
import { useAuth } from "../Auth";
import { useMutation } from "react-query";
import { CommentType, CommentData } from "../../types/Types";
import { createComment, createCommentChain } from "../../utils/queries";
import { usePreventPageChange } from "../hooks/usePreventPageChange";
import debug from "debug";

const log = debug("bobafrontend:commentEditor-log");
const error = debug("bobafrontend:commentEditor-error");

const CommentEditorModal: React.FC<CommentEditorModalProps> = (props) => {
  const [isCommentLoading, setCommentLoading] = React.useState(false);
  const [askConfirmation, setAskConfirmation] = React.useState(false);
  usePreventPageChange(() => props.isOpen, props.onCloseModal, [props.isOpen]);
  const { isLoggedIn } = useAuth();

  const { mutate: postComment } = useMutation(
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
        setCommentLoading(false);
      },
      onSuccess: (data: CommentType) => {
        log(`Received comment data after save:`);
        log(data);
        props.onCommentsSaved([data]);
        setCommentLoading(false);
      },
    }
  );

  const { mutate: postCommentChain } = useMutation(
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
    <>
      <Modal isOpen={props.isOpen}>
        <div className="editor">
          <CommentChainEditor
            secretIdentity={props.secretIdentity}
            userIdentity={props.userIdentity}
            additionalIdentities={props.additionalIdentities}
            loading={isCommentLoading}
            onSubmit={({ texts, identityId }) => {
              if (!props.replyTo || !props.replyTo.postId) {
                return;
              }
              setCommentLoading(true);
              if (texts.length > 1) {
                postCommentChain({
                  replyToPostId: props.replyTo.postId,
                  commentData: texts.map((t) => ({
                    content: t,
                    forceAnonymous: false,
                    identityId,
                    replyToCommentId: props.replyTo?.commentId || null,
                  })),
                });
              } else {
                postComment({
                  replyToPostId: props.replyTo.postId,
                  commentData: {
                    content: texts[0],
                    forceAnonymous: false,
                    identityId,
                    replyToCommentId: props.replyTo?.commentId || null,
                  },
                });
              }
            }}
            onCancel={(empty) =>
              empty ? props.onCloseModal() : setAskConfirmation(true)
            }
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
      <ModalWithButtons
        isOpen={askConfirmation}
        onCloseModal={() => setAskConfirmation(false)}
        onSubmit={() => {
          setAskConfirmation(false);
          props.onCloseModal();
        }}
        primaryText={"Exterminate!"}
        secondaryText={"Nevermind"}
        shouldCloseOnOverlayClick={false}
      >
        Are you sure?
      </ModalWithButtons>
    </>
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
  additionalIdentities?: {
    id: string;
    avatar: string;
    name: string;
  }[];
  onCommentsSaved: (comments: CommentType[]) => void;
  replyTo: {
    postId: string | null;
    commentId: string | null;
  } | null;
}

export default CommentEditorModal;
