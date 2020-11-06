import "@bobaboard/ui-components/dist/main.css";
import "normalize.css";
import smoothscroll from "smoothscroll-polyfill";

import React from "react";
import axios from "axios";
import Head from "next/head";
import { AuthProvider, useAuth } from "../components/Auth";
import { BoardContextProvider } from "../components/BoardContext";
import type { AppProps } from "next/app";
import {
  ToastContainer,
  toast,
  setTumblrEmbedFetcher,
  setOEmbedFetcher,
  // @ts-ignore
} from "@bobaboard/ui-components";
import { NextPageContext } from "next";
import { BoardData } from "types/Types";
import { makeClientBoardData, getServerBaseUrl } from "utils/server-utils";
// import debug from "debug";
// const logging = debug("bobafrontend:app-log");

if (typeof window !== "undefined") {
  smoothscroll.polyfill();
}

axios.defaults.baseURL = getServerBaseUrl();
// We make the axios interceptor be a component so we can have auth
// provided within.
const AxiosInterceptor = () => {
  const { getAuthIdToken } = useAuth();
  React.useEffect(() => {
    axios.interceptors.request.use((config) => {
      return getAuthIdToken().then((idToken: string) => {
        config.headers.authorization = idToken;
        return config;
      });
    });
    axios.interceptors.response.use(
      (res) => res,
      (err) => {
        toast.error(err.message, {
          toastId: err.message,
          autoClose: false,
          hideProgressBar: true,
          closeOnClick: false,
        });
      }
    );
  }, []);
  return null;
};

const embedsAxios = axios.create();
setTumblrEmbedFetcher((url: string) => {
  return embedsAxios.get(`posts/embed/tumblr?url=${url}`).then((res) => {
    return res.data;
  });
});
setOEmbedFetcher((url: string) => {
  // We add a random number to the embed load to get around https://github.com/itteco/iframely/issues/281
  return embedsAxios
    .get(
      `https://embeds-dot-bobaboard.uc.r.appspot.com/iframely?uri=${url}&iframe=0&test=${Math.floor(
        Math.random() * 100000
      )}`
    )
    .then((res) => {
      return res.data;
    });
});

function MyApp({
  Component,
  pageProps,
  // @ts-ignore
  props,
}: AppProps<{ [key: string]: BoardData }>) {
  return (
    <>
      <Head>
        <title>
          BobaBoard v0 — Where the bugs are funny and the people are cool!
        </title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link rel="manifest" href="/icons/site.webmanifest"></link>
      </Head>
      <AuthProvider>
        <AxiosInterceptor />
        <BoardContextProvider
          initialData={props?.boardData.map(makeClientBoardData) || []}
        >
          <ToastContainer />
          <Component {...pageProps} />
        </BoardContextProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;

MyApp.getInitialProps = async ({ ctx }: { ctx: NextPageContext }) => {
  const body = await axios.get(`${getServerBaseUrl(ctx)}boards`);
  const boardData = await body.data;
  return {
    props: { boardData },
  };
};
