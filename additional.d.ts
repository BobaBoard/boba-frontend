import type { AppContext, NextPageContext } from "next";
import type { AppProps } from "next/app";
import type { QueryClient } from "react-query";

declare type AppContextWithQueryClient = AppContext & {
  queryClient: QueryClient;
};

declare type PageContextWithQueryClient = NextPageContext & {
  queryClient: QueryClient;
};

declare type AppPropsWithPropsType<P = unknown> = P &
  Omit<AppProps<P>, "pageProps">;
