import client from "../client";
import type { ResponseConfig } from "../client";
import type { EditContributionMutationRequest, EditContributionMutationResponse, EditContributionPathParams } from "../models/EditContribution";

/**
 * @description Edits a contribution (for now just its tags).
 * @summary Edits a contribution.
 * @link /posts/:post_id/contributions
 */
export async function editContribution<TData = EditContributionMutationResponse,TVariables = EditContributionMutationRequest>(postId: EditContributionPathParams["post_id"], data: TVariables, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData, TVariables>({
      method: "patch",
      url: `/posts/${postId}/contributions`,
      data,
      ...options
   });
};