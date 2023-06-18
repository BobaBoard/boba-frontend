import { ModalWithButtons } from "@bobaboard/ui-components";
import { PostType } from "types/Types";
import React from "react";
import { useDeletePost } from "lib/api/hooks/post";

export default function DeleteEntityConfirmationModal(props: {
  // TODO: add comment type here
  post: PostType | null;
  onCloseModal: () => void;
}) {
  const { post, onCloseModal } = props;
  const deletePost = useDeletePost();

  if (!post) {
    return null;
  }

  return (
    <ModalWithButtons
      isOpen={true}
      onCloseModal={onCloseModal}
      onSubmit={() => {
        deletePost({ post });
        onCloseModal();
      }}
      primaryText={"Exterminate!"}
      secondaryText={"Nevermind"}
      shouldCloseOnOverlayClick={false}
    >
      Are you sure?
    </ModalWithButtons>
  );
}
