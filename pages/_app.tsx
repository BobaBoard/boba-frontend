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

const getTitle = (currentBoardData: BoardData | undefined) => {
  return currentBoardData
    ? `BobaBoard v0 — !${currentBoardData.slug} — Where the bugs are funny and the people are cool!`
    : "BobaBoard v0 — Where the bugs are funny and the people are cool!";
};

const getImage = (currentBoardData: BoardData | undefined) => {
  return currentBoardData
    ? currentBoardData.avatarUrl
    : "https://v0.boba.social/bobatan.png";
};

const getDescription = (currentBoardData: BoardData | undefined) => {
  return currentBoardData
    ? currentBoardData.tagline
    : `BobaBoard is an upcoming commmunity (and platform) aiming to balance the freedom and wonder of the early 00s web with a modern user experience and ethos. Feel free to look around, but remember: what you see is Work in Progress! Read more (and get involved) at www.bobaboard.com.`;
};

function MyApp({
  Component,
  pageProps,
  // @ts-ignore
  props,
}: AppProps<{ [key: string]: BoardData }>) {
  const boardData: BoardData[] =
    props?.boardData.map(makeClientBoardData) || [];
  const currentBoardData = boardData.find((board) => board.slug == props.slug);
  return (
    <>
      <Head>
        <title>{getTitle(currentBoardData)}</title>
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
        <BoardContextProvider initialData={boardData}>
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
    props: { boardData, slug: ctx.query.boardId?.slice(1) },
  };
};
