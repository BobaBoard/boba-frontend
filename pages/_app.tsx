import "../wdyr";
import "@bobaboard/ui-components/dist/main.css";
import "normalize.css";

import {
  AppContextWithQueryClient,
  AppPropsWithPropsType,
  GlobalAppProps,
} from "additional";
import { AuthProvider, useAuth } from "components/Auth";
import {
  EditorContext,
  ImageUploaderContext,
  ToastContainer,
  toast,
} from "@bobaboard/ui-components";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
  dehydrate,
} from "react-query";
import {
  REALM_QUERY_KEY,
  RealmContextProvider,
} from "../contexts/RealmContext";
import {
  getCurrentHost,
  getCurrentRealmSlug,
  getRedirectToSandboxLocation,
  getServerBaseUrl,
  isAllowedSandboxLocation,
  isClientContext,
} from "utils/location-utils";

import App from "next/app";
import { CustomErrorPage } from "./_error";
import { ErrorBoundary } from "@stefanprobst/next-error-boundary";
import Head from "next/head";
import OpenGraphMeta from "components/OpenGraphMeta";
import { QueryParamProvider } from "components/QueryParamNextProvider";
import React from "react";
import { ReactQueryDevtools } from "react-query/devtools";
import { UpdateNotice } from "components/UpdateNotice";
import axios from "axios";
import debug from "debug";
import embedsCache from "utils/embeds-cache";
import { getRealmData } from "utils/queries/realm";
import smoothscroll from "smoothscroll-polyfill";
import { useConsoleHelloMessage } from "components/hooks/useConsoleHelloMessage";
import useFromBackButton from "components/hooks/useFromBackButton";
import { useImageUploader } from "utils/image-upload";
import { usePageDataListener } from "utils/router-utils";
import { useScrollRestoration } from "components/hooks/useScrollRestoration";

const log = debug("bobafrontend:app-log");

const logRequest = debug("bobafrontend:app:requests-log");

if (typeof window !== "undefined") {
  smoothscroll.polyfill();
  require("requestidlecallback-polyfill");
}

axios.defaults.baseURL = getServerBaseUrl();
// We make the axios interceptor be a component so we can have auth
// provided within.
// TODO: make this into a hook.
const AxiosInterceptor = () => {
  const { getAuthIdToken } = useAuth();
  React.useEffect(() => {
    axios.interceptors.request.use((config) => {
      logRequest(`Queing request for ${config.url}`);
      return getAuthIdToken!().then((idToken: string) => {
        logRequest(
          `Sending request for ${config.url} ${
            idToken ? "WITH" : "WITHOUT"
          } id token ${idToken ? `(${idToken.substr(0, 5)}...)` : ""}.`
        );
        log(idToken);
        config.headers = config.headers ?? {};
        config.headers.authorization = idToken;
        return config;
      });
    });
    axios.interceptors.response.use(
      (res) => {
        return res;
      },
      (err) => {
        toast.error(err.message, {
          toastId: err.message,
        });
      }
    );
  }, [getAuthIdToken]);
  return null;
};

const embedsAxios = axios.create();
const embedsFetchers = {
  getOEmbedFromUrl: (url: string) => {
    // We add a random number to the embed load to get around https://github.com/itteco/iframely/issues/281
    return embedsAxios
      .get(
        `https://boba-embeds.herokuapp.com/iframely?uri=${url}&iframe=0&test=${Math.floor(
          Math.random() * 100000
        )}`
      )
      .then((res) => {
        return res.data;
      });
  },
};
const editorContext = {
  cache: embedsCache,
  fetchers: embedsFetchers,
};

// TODO: does this need to be moved within App?
const queryClient = new QueryClient();

const DefaultFavicon = () => {
  return (
    <>
      <link rel="icon" type="image/svg+xml" href="/icons/logo-compact.svg" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/icons/apple-touch-icon.png"
      />
      <link
        rel="alternate icon"
        type="image/png"
        sizes="32x32"
        href="/icons/favicon-32x32.png"
      />
      <link
        rel="alternate icon"
        type="image/png"
        sizes="16x16"
        href="/icons/favicon-16x16.png"
      />
      <link rel="manifest" href="/icons/site.webmanifest"></link>
    </>
  );
};

function BobaBoardApp({
  Component,
  router,
  ...props
}: AppPropsWithPropsType & { favicon: string | null }) {
  log(`Re-rendering app`);
  useFromBackButton(router);
  usePageDataListener(router, props.serverHostname);
  useScrollRestoration(router);
  useConsoleHelloMessage();
  // TODO: figure out how to remove this from here or at least not have to pass it router.
  const imageUploader = useImageUploader(router);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=1.0"
        ></meta>
        {props.favicon ? (
          <link rel="icon" type="image/x-icon" href={props.favicon} />
        ) : (
          <DefaultFavicon />
        )}
      </Head>
      <ToastContainer />
      <ErrorBoundary fallback={<CustomErrorPage />}>
        <QueryParamProvider router={router}>
          <QueryClientProvider client={queryClient}>
            <Hydrate state={props.dehydratedState}>
              <EditorContext.Provider value={editorContext}>
                <ImageUploaderContext.Provider value={imageUploader}>
                  <AuthProvider>
                    <AxiosInterceptor />
                    <UpdateNotice />
                    <RealmContextProvider serverHostname={props.serverHostname}>
                      <OpenGraphMeta
                        slug={props.boardSlug}
                        threadSummary={props.summary}
                      />
                      {React.useMemo(
                        () => (
                          // @ts-expect-error
                          <Component {...props.pageProps} />
                        ),
                        [Component, props.pageProps]
                      )}
                    </RealmContextProvider>
                  </AuthProvider>
                </ImageUploaderContext.Provider>
              </EditorContext.Provider>
              <ReactQueryDevtools initialIsOpen={false} />
            </Hydrate>
          </QueryClientProvider>
        </QueryParamProvider>
      </ErrorBoundary>
    </>
  );
}
export default BobaBoardApp;

BobaBoardApp.getInitialProps = async (
  appContext: AppContextWithQueryClient
): Promise<
  (GlobalAppProps & { favicon: string | null }) | Record<string, never>
> => {
  const { ctx } = appContext;
  if (isClientContext(ctx)) {
    // BUG: This is necessary because running `getInitialProps` on the client (which
    // happens automatically) will cause the page to scroll back to the top when the
    // function returns.
    // I suspect this is due to a mismatch between queries in server-side queryClient
    // and client-side queryClient. We should revisit removing this when:
    // a) we can check logged in status from both server and client
    // b) NextJS' Layout RFC lands & we use a compatible version.
    return {};
  }
  if (!isAllowedSandboxLocation(ctx)) {
    // We should use 302 redirect here rather than 301 because
    // 301 will be cached by the client and trap us forever until
    // the cache is cleared.
    ctx.res?.writeHead(302, {
      location: `http://${getCurrentHost(
        ctx?.req?.headers?.host,
        true
      )}${getRedirectToSandboxLocation(ctx)}`,
    });
    ctx.res?.end();
    return {};
  }

  axios.defaults.baseURL = getServerBaseUrl(ctx);
  const queryClient = new QueryClient();
  ctx.queryClient = queryClient;
  const realmSlug = getCurrentRealmSlug({
    serverHostname: ctx.req?.headers.host,
  });

  log(`Fetching data for realm ${realmSlug}`);
  const realmBody = await getRealmData({
    realmSlug,
  });
  if (Array.isArray(ctx.query.boardId)) {
    throw new Error("Expected single board id");
  }
  const realmData = await realmBody;

  await queryClient.setQueryData(
    [REALM_QUERY_KEY, { realmSlug, isLoggedIn: false }],
    realmData
  );
  log(`Returning initial props`);
  const appProps = await App.getInitialProps(appContext);
  return {
    serverHostname: ctx?.req?.headers?.host,
    boardSlug: ctx.query.boardId?.slice(1),
    favicon: realmData.favicon || null,
    ...appProps,
    dehydratedState: dehydrate(queryClient),
    summary: appProps.pageProps.summary,
  };
};
