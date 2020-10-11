import React from "react";
// @ts-ignore
import {
  CommentChainEditor,
  Modal,
  ModalWithButtons,
  toast,
} from "@bobaboard/ui-components";
import { useAuth } from "./Auth";
import { useMutation } from "react-query";
import { CommentType, CommentData } from "../types/Types";
import { createComment, createCommentChain } from "../utils/queries";
import { useRouter } from "next/router";
import debug from "debug";

const log = debug("bobafrontend:commentEditor-log");
const error = debug("bobafrontend:commentEditor-error");

const CommentEditorModal: React.FC<CommentEditorModalProps> = (props) => {
  const [isCommentLoading, setCommentLoading] = React.useState(false);
  const [askConfirmation, setAskConfirmation] = React.useState(false);
  const isCurrentlyOpen = React.useRef(props.isOpen);
  const router = useRouter();
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

  React.useEffect(() => {
    isCurrentlyOpen.current = props.isOpen;
  }, [props.isOpen]);

  React.useEffect(() => {
    const unloadListener = (e: BeforeUnloadEvent) => {
      if (isCurrentlyOpen.current) {
        e.preventDefault();
        e.returnValue = true;
      }
    };
    router.beforePopState((state: any) => {
      console.log("pop");
      console.log(state);
      console.log(router);
      if (
        state.as == router.asPath ||
        !isCurrentlyOpen.current ||
        confirm("Do you want to go back?")
      ) {
        return true;
      }
      history.forward();
      return false;
    });
    window.addEventListener("beforeunload", unloadListener);
    return () => {
      window.removeEventListener("beforeunload", unloadListener);
    };
  }, []);
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
            loading={isCommentLoading}
            onSubmit={(text: string[]) => {
              if (!props.replyTo || !props.replyTo.postId) {
                return;
              }
              setCommentLoading(true);
              if (text.length > 1) {
                postCommentChain({
                  replyToPostId: props.replyTo.postId,
                  commentData: text.map((t) => ({
                    content: t,
                    forceAnonymous: false,
                    replyToCommentId: props.replyTo?.commentId || null,
                  })),
                });
              } else {
                postComment({
                  replyToPostId: props.replyTo.postId,
                  commentData: {
                    content: text[0],
                    forceAnonymous: false,
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
  onCommentsSaved: (comments: CommentType[]) => void;
  replyTo: {
    postId: string | null;
    commentId: string | null;
  } | null;
}

export default CommentEditorModal;
