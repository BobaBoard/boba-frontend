import type { AxiosRequestConfig, AxiosResponse } from "axios";

import axios from "axios";

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
  headers?: AxiosRequestConfig["headers"];
};

export type ResponseConfig<TData> = AxiosResponse<TData>;

export const axiosInstance = axios.create({
  baseURL: "http://localhost:4200",
  //   headers: '{}' ? JSON.parse('{}') : {},
});

export const axiosClient = async <
  TData,
  TError = unknown,
  TVariables = unknown
>(
  config: RequestConfig<TVariables>
): Promise<AxiosResponse<TData>> => {
  return axiosInstance.request<TData>({ ...config });
};

export default axiosClient;
