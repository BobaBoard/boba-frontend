import { CommentChainEditor, toast } from "@bobaboard/ui-components";
import { CommentData, CommentType } from "types/Types";

import React from "react";
import { createCommentChain } from "utils/queries/post";
import debug from "debug";
import { isCommentEditorState } from "./types";
import { useAuth } from "components/Auth";
import { useEditorsState } from "./EditorsContext";
import { useMutation } from "react-query";
import { useThreadDetails } from "./utils";

const log = debug("bobafrontend:commentEditor-log");
const error = debug("bobafrontend:commentEditor-error");

const CommentEditorModal: React.FC<CommentEditorModalProps> = (props) => {
  const [isCommentLoading, setCommentLoading] = React.useState(false);
  const { isLoggedIn } = useAuth();

  const state = useEditorsState();
  if (!isCommentEditorState(state)) {
    throw new Error(
      "CommentEditorModal must only be rendered when the editor is open and a comment is being edited."
    );
  }
  const { additionalIdentities, secretIdentity, userIdentity, accessories } =
    useThreadDetails(state);

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
        setCommentLoading(false);
      },
      onSuccess: (data: CommentType[]) => {
        log(`Received comment data after save:`);
        log(data);
        setCommentLoading(false);
        props.onCommentsSaved(data);
      },
    }
  );

  if (!isLoggedIn || !userIdentity) {
    return <div />;
  }

  return (
    <div className="editor">
      <CommentChainEditor
        secretIdentity={secretIdentity}
        userIdentity={userIdentity}
        additionalIdentities={additionalIdentities}
        loading={isCommentLoading}
        accessories={
          secretIdentity || !accessories?.length ? undefined : accessories
        }
        onSubmit={async ({ texts, identityId, accessoryId }) => {
          setCommentLoading(true);
          const uploadedTexts = await texts;
          postCommentChain({
            replyToPostId: state.newComment.replyToContributionId,
            commentData: uploadedTexts.map((t) => ({
              content: t,
              forceAnonymous: false,
              identityId,
              accessoryId,
              replyToCommentId: state.newComment.replyToCommentId,
            })),
          });
        }}
        onCancel={props.onCancel}
      />
      <style jsx>{`
        .editor {
          display: flex;
          justify-content: center;
          padding: 0 15px 15px;
        }
      `}</style>
    </div>
  );
};

export interface CommentEditorModalProps {
  onCancel: (empty: boolean) => void;
  onCommentsSaved: (comments: CommentType[]) => void;
}

export default CommentEditorModal;
