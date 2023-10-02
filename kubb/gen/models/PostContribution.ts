import type { Contribution } from "./Contribution";
import type { Tags } from "./Tags";
import type { IdentityParams } from "./IdentityParams";

/**
 * @description User was not found in request that requires authentication.
*/
export type PostContribution401 = any | null;

/**
 * @description User is not authorized to perform the action.
*/
export type PostContribution403 = any | null;

export type PostContributionPathParams = {
    /**
     * @description The uuid of the contribution to reply to.
     * @type string uuid
    */
    post_id: string;
};

/**
 * @description The contribution was successfully created.
*/
export type PostContributionMutationResponse = {
    contribution?: Contribution | undefined;
};

/**
 * @description The details of the contribution to post.
*/
export type PostContributionMutationRequest = ({
    /**
     * @type string | undefined quill-delta
    */
    content?: string | undefined;
} & Tags & IdentityParams);
