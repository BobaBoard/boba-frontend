import type { NextPageContext } from "next";
import type { AppContext, AppProps } from "next/app";
import type { QueryClient } from "react-query";

declare type PageContextWithQueryClient = NextPageContext & {
  queryClient: QueryClient;
};

declare type AppContextWithQueryClient = Omit<AppContext, "ctx"> & {
  ctx: PageContextWithQueryClient;
};

declare type AppPropsWithPropsType<P = unknown> = P &
  Omit<AppProps<P>, "pageProps">;
