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
} from "utils/location-utils";

import App from "next/app";
import { CustomErrorPage } from "./_error";
import ErrorBoundary from "@stefanprobst/next-error-boundary";
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

const queryClient = new QueryClient();

function BobaBoardApp({ Component, router, ...props }: AppPropsWithPropsType) {
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
                      <Component />
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
): Promise<GlobalAppProps | Record<string, never>> => {
  const { ctx } = appContext;
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
  const appProps = await App.getInitialProps(appContext);
  if (Array.isArray(ctx.query.boardId)) {
    throw new Error("Expected single board id");
  }
  const realmData = await realmBody;

  await queryClient.setQueryData(
    [REALM_QUERY_KEY, { realmSlug, isLoggedIn: false }],
    realmData
  );
  log(`Returning initial props`);
  return {
    serverHostname: ctx?.req?.headers?.host,
    boardSlug: ctx.query.boardId?.slice(1),
    ...appProps,
    dehydratedState: dehydrate(queryClient),
    summary: appProps.pageProps.summary,
  };
};
