import client from "../client";
import type { ResponseConfig } from "../client";
import type { PostContributionMutationRequest, PostContributionMutationResponse, PostContributionPathParams } from "../types/PostContribution";

/**
     * @description Posts a contribution replying to the one with id {postId}.
     * @summary Replies to a contribution with another contribution.
     * @link /posts/:post_id/contributions
     */
export async function postContribution (postId: PostContributionPathParams["post_id"], data: PostContributionMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<PostContributionMutationResponse>> {
      return client<PostContributionMutationResponse, PostContributionMutationRequest>({
          method: "post",
        url: `/posts/${postId}/contributions`,
        data,
        ...options
      });
};