import "../wdyr";

import App, { AppContext } from "next/app";
import ErrorBoundary from "@stefanprobst/next-error-boundary";
import { CustomErrorPage } from "./_error";
import "@bobaboard/ui-components/dist/main.css";
import "normalize.css";
import smoothscroll from "smoothscroll-polyfill";
import React from "react";
import axios from "axios";
import Head from "next/head";
import { AuthProvider, useAuth } from "../components/Auth";
import { RealmContextProvider } from "../contexts/RealmContext";
import useFromBackButton from "../components/hooks/useFromBackButton";
import { useScrollRestoration } from "../components/hooks/useScrollRestoration";
import { UpdateNotice } from "../components/UpdateNotice";
import type { AppProps } from "next/app";
import {
  ToastContainer,
  toast,
  EditorContext,
  ImageUploaderContext,
} from "@bobaboard/ui-components";
import { useImageUploader } from "../utils/image-upload";
import { BoardData, BoardSummary } from "types/Types";
import { QueryParamProvider } from "../components/QueryParamNextProvider";
import {
  getServerBaseUrl,
  isAllowedSandboxLocation,
  getRedirectToSandboxLocation,
  getCurrentHost,
  getCurrentRealmSlug,
} from "utils/location-utils";
import { makeClientBoardData } from "utils/client-data";
import debug from "debug";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import embedsCache from "../utils/embeds-cache";
import { usePageDataListener } from "utils/router-utils";
import { getRealmData } from "utils/queries/realm";
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
  getTumblrEmbedFromUrl: (url: string) => {
    return embedsAxios.get(`posts/embed/tumblr?url=${url}`).then((res) => {
      return res.data;
    });
  },
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

export const getTitle = (
  currentBoardData: BoardSummary | BoardData | undefined | null
) => {
  return currentBoardData
    ? `BobaBoard v0 — !${currentBoardData.slug} — Where the bugs are funny and the people are cool!`
    : "BobaBoard v0 — Where the bugs are funny and the people are cool!";
};

const getImage = (currentBoardData: BoardData | BoardData | undefined) => {
  return currentBoardData
    ? currentBoardData.avatarUrl
    : "https://v0.boba.social/bobatan.png";
};

const getDescription = (
  currentBoardData: BoardData | BoardData | undefined
) => {
  return currentBoardData
    ? currentBoardData.tagline
    : `BobaBoard is an upcoming commmunity (and platform) aiming to balance the freedom and wonder of the early 00s web with a modern user experience and ethos. Feel free to look around, but remember: what you see is Work in Progress! Read more (and get involved) at www.bobaboard.com.`;
};
const queryClient = new QueryClient();

function MyApp({
  Component,
  router,
  // TODO: theoretically this should be pageProps, but pageProps is always null
  // and props is filled instead.
  // @ts-ignore
  props,
}: AppProps<{ [key: string]: BoardData }>) {
  log(`Re-rendering app`);
  const boardData: BoardData[] = React.useMemo(
    () => props?.realmData.boards.map(makeClientBoardData) || [],
    [props?.realmData]
  );
  const currentBoardData = boardData.find((board) => board.slug == props.slug);
  useFromBackButton(router);
  usePageDataListener(router);
  useScrollRestoration(router);
  const imageUploader = useImageUploader(router);

  React.useEffect(() => {
    console.log(
      "%c~*Welcome to BobaBoard*~",
      "font-size: 30px; color: white; text-shadow: -1px 2px 0 #ff4284, 1px 2px 0 #ff4284, 1px -2px 0 #ff4284, -1px -2px 0 #ff4284;"
    );
    console.log(
      "%cIf you're here out of curiosity, hello!°꒳°",
      "font-size: 20px; color: #ff4284;"
    );
    console.log(
      "%c★★★★ If you know what you're doing, please consider volunteering: https://docs.google.com/forms/d/e/1FAIpQLSdCX2_fZgIYX0PXeCAA-pfQrcLw_lSp2clGHTt3uBTWgnwVSw/viewform ★★★★",
      "font-size: 16px; color: #ff4284;"
    );
  }, []);

  return (
    <>
      <Head>
        <title>{getTitle(currentBoardData)}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=1.0"
        ></meta>
        <meta property="og:title" content={getTitle(currentBoardData)} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={getDescription(currentBoardData)}
        />
        <meta property="og:image" content={getImage(currentBoardData)} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@BobaBoard" />
        <meta name="twitter:title" content={getTitle(currentBoardData)} />
        <meta
          name="twitter:description"
          content={getDescription(currentBoardData)}
        />
        <meta name="twitter:image" content={getImage(currentBoardData)} />
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
            <EditorContext.Provider value={editorContext}>
              <ImageUploaderContext.Provider value={imageUploader}>
                <AuthProvider>
                  <AxiosInterceptor />
                  <UpdateNotice />
                  <RealmContextProvider initialData={props.realmData}>
                    {React.useMemo(
                      () => (
                        <Component {...props} />
                      ),
                      [Component, props]
                    )}
                  </RealmContextProvider>
                </AuthProvider>
              </ImageUploaderContext.Provider>
            </EditorContext.Provider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </QueryParamProvider>
      </ErrorBoundary>
    </>
  );
}
export default MyApp;

MyApp.getInitialProps = async (appContext: AppContext) => {
  // TODO[realms]: figure out why it fetches /undefined sometimes
  // September 2021: it does it when you first load the main page on localhost.
  const { ctx } = appContext;
  const realmSlug = getCurrentRealmSlug(ctx);
  log(`Fetching data for realm ${realmSlug}`);
  const realmBody = await getRealmData({
    baseUrl: getServerBaseUrl(ctx),
    realmSlug,
  });
  const appProps = await App.getInitialProps(appContext);
  const realmData = await realmBody;

  if (!isAllowedSandboxLocation(ctx)) {
    // We should use 302 redirect here rather than 301 because
    // 301 will be cached by the client and trap us forever until
    // the cache is cleared.
    ctx.res?.writeHead(302, {
      location: `http://${getCurrentHost(
        ctx,
        true
      )}${getRedirectToSandboxLocation(ctx)}`,
    });
    ctx.res?.end();
    return;
  }
  log(`Returning initial props`);
  return {
    props: {
      realmData,
      realmSlug,
      slug: ctx.query.boardId?.slice(1),
      currentPath: ctx.asPath,
      ...appProps.pageProps,
    },
  };
};
