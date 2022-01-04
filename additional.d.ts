import type { AppContext, NextPageContext } from "next";
import type { QueryClient } from "react-query";

declare type AppContextWithQueryClient = AppContext & {
  queryClient: QueryClient;
};

declare type PageContextWithQueryClient = NextPageContext & {
  queryClient: QueryClient;
};
