import client from "../client";
import type { ResponseConfig } from "../client";
import type { PostCommentMutationRequest, PostCommentMutationResponse, PostCommentPathParams } from "../types/PostComment";

/**
     * @description Creates a comment nested under the contribution with id {post_id}.
     * @summary Add comments to a contribution, optionally nested under another comment.
     * @link /posts/:post_id/comments
     */
export async function postComment (postId: PostCommentPathParams["post_id"], data?: PostCommentMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<PostCommentMutationResponse>> {
      return client<PostCommentMutationResponse, PostCommentMutationRequest>({
          method: "post",
        url: `/posts/${postId}/comments`,
        data,
        ...options
      });
};