import client from "../client";
import type { ResponseConfig } from "../client";
import type { EditContributionMutationRequest, EditContributionMutationResponse, EditContributionPathParams } from "../types/EditContribution";

/**
     * @description Edits a contribution (for now just its tags).
     * @summary Edits a contribution.
     * @link /posts/:post_id/contributions
     */
export async function editContribution (postId: EditContributionPathParams["post_id"], data: EditContributionMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<EditContributionMutationResponse>> {
      return client<EditContributionMutationResponse, EditContributionMutationRequest>({
          method: "patch",
        url: `/posts/${postId}/contributions`,
        data,
        ...options
      });
};