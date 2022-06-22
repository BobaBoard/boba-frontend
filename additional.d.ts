/// <reference types="jest-extended" />

import type { NextPageContext } from "next";
import type { AppContext, AppProps } from "next/app";
import type { QueryClient, DehydratedState } from "react-query";
import type { getDeltaSummary } from "@bobaboard/ui-components";

declare type GlobalAppProps = {
  serverHostname: string | undefined;
  boardSlug: string | undefined;
  dehydratedState: DehydratedState;
  summary?: ReturnType<typeof getDeltaSummary> | undefined;
};

declare type PageContextWithQueryClient = NextPageContext & {
  queryClient: QueryClient;
};

declare type AppContextWithQueryClient = Omit<AppContext, "ctx"> & {
  ctx: PageContextWithQueryClient;
};

declare type AppPropsWithPropsType<P = unknown> = {
  pageProps: P;
} & Omit<AppProps<P>, "pageProps"> &
  GlobalAppProps;

// TODO: this suddenly became necessary after upgrade to Next11.
// Revisit later.
declare module "react" {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}
