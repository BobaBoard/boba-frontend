import type { AxiosError, AxiosHeaders } from "axios";
import axios, { AxiosResponse } from "axios";

export type RequestConfig<TVariables = unknown> = {
  method: "get" | "put" | "patch" | "post" | "delete";
  url: string;
  params?: unknown;
  data?: TVariables;
  responseType?:
    | "arraybuffer"
    | "blob"
    | "document"
    | "json"
    | "text"
    | "stream";
  signal?: AbortSignal;
};

export const axiosInstance = axios.create({
  baseURL:
    typeof "http://localhost:4200" !== "undefined"
      ? "http://localhost:4200"
      : undefined,
  headers:
    typeof "{}" !== "undefined"
      ? (JSON.parse("{}") as AxiosHeaders)
      : undefined,
});

export const axiosClient = async <
  TData,
  TError = unknown,
  TVariables = unknown
>(
  config: RequestConfig<TVariables>
): Promise<AxiosResponse<TData>> => {
  const promise = axiosInstance.request<TData>({ ...config });

  return promise;
};

export default axiosClient;
