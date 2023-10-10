import client from "../client";
import type { ResponseConfig } from "../client";
import type { PostContributionMutationRequest, PostContributionMutationResponse, PostContributionPathParams } from "../models/PostContribution";

/**
 * @description Posts a contribution replying to the one with id {postId}.
 * @summary Replies to a contribution with another contribution.
 * @link /posts/:post_id/contributions
 */
export async function postContribution<TData = PostContributionMutationResponse,TVariables = PostContributionMutationRequest>(postId: PostContributionPathParams["post_id"], data: TVariables, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData, TVariables>({
      method: "post",
      url: `/posts/${postId}/contributions`,
      data,
      ...options
   });
};