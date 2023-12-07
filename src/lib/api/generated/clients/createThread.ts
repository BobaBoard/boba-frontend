import client from "../client";
import type { ResponseConfig } from "../client";
import type { CreateThreadMutationRequest, CreateThreadMutationResponse, CreateThreadPathParams } from "../types/CreateThread";

/**
     * @description Creates a new thread in the specified board.
     * @summary Create a new thread.
     * @link /boards/:board_id
     */
export async function createThread (boardId: CreateThreadPathParams["board_id"], data: CreateThreadMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<CreateThreadMutationResponse>> {
      return client<CreateThreadMutationResponse, CreateThreadMutationRequest>({
          method: "post",
        url: `/boards/${boardId}`,
        data,
        ...options
      });
};