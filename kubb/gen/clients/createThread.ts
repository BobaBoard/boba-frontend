import client from "../client";
import type { ResponseConfig } from "../client";
import type { CreateThreadMutationRequest, CreateThreadMutationResponse, CreateThreadPathParams } from "../models/CreateThread";

/**
 * @description Creates a new thread in the specified board.
 * @summary Create a new thread.
 * @link /boards/:board_id
 */
export async function createThread<TData = CreateThreadMutationResponse,TVariables = CreateThreadMutationRequest>(boardId: CreateThreadPathParams["board_id"], data: TVariables, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<TData>> {
   return client<TData, TVariables>({
      method: "post",
      url: `/boards/${boardId}`,
      data,
      ...options
   });
};