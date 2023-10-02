import client from "../client";
import type { PostCommentMutationRequest, PostCommentMutationResponse, PostCommentPathParams } from "../models/PostComment";

/**
 * @description Creates a comment nested under the contribution with id {post_id}.
 * @summary Add comments to a contribution, optionally nested under another comment.
 * @link /posts/:post_id/comments
 */
export function postComment <TData = PostCommentMutationResponse, TVariables = PostCommentMutationRequest>(postId: PostCommentPathParams["post_id"], data: TVariables, options: Partial<Parameters<typeof client>[0]> = {}): Promise<TData> {
  return client<TData, TVariables>({
    method: "post",
    url: `/posts/${postId}/comments`,
    data,
    ...options
  });
};
