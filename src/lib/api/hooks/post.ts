import { PostType } from "types/Types";
import debug from "debug";
import { deletePost } from "utils/queries/post";
import { toast } from "@bobaboard/ui-components";
import { useMutation } from "react-query";

// const info = debug("bobafrontend:hooks:queries:thread-info");
// const error = debug("bobafrontend:hooks:queries:thread-error");
const log = debug("bobafrontend:hooks:queries:thread-log");

export const useDeletePost = () => {
  const { mutate } = useMutation(
    ({ post }: { post: PostType }) => deletePost(post.postId),
    {
      onMutate: ({ post }) => {
        log(`Optimistically deleting post ${post.postId}.`);
        // TODO: implement this
        // setPostDeletedInCache(queryClient, {
        //     post
        // });
      },
      onError: (error: Error, { post }) => {
        toast.error(
          `Error while deleting post ${post.postId}: ${error.message}`
        );
        log(error);
      },
      onSuccess: () => {
        // We don't refetch thread here as that would also cause the
        // loading of new thread data.
      },
    }
  );

  return mutate;
};
