import "@bobaboard/ui-components/dist/main.css";
import "normalize.css";
import smoothscroll from "smoothscroll-polyfill";

import React from "react";
import axios from "axios";
import Head from "next/head";
import { AuthProvider, useAuth } from "../components/Auth";
import { BoardThemeProvider } from "../components/BoardTheme";
import {
  ToastContainer,
  toast,
  setTumblrEmbedFetcher,
  // @ts-ignore
} from "@bobaboard/ui-components";

let location;
let isStaging = false;
if (typeof window !== "undefined") {
  smoothscroll.polyfill();
  location = window.location.hostname;
  isStaging = new URL(window.location.href).hostname.startsWith("staging");
}

axios.defaults.baseURL =
  process.env.NODE_ENV == "production"
    ? isStaging
      ? "https://staging-dot-backend-dot-bobaboard.uc.r.appspot.com/"
      : "https://backend-dot-bobaboard.uc.r.appspot.com/"
    : `http://${location}:4200/`;

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

setTumblrEmbedFetcher((url: string) => {
  console.log(`""Fetching"" from ${url}`);
  return axios.get(`posts/embed/tumblr?url=${url}`).then((res) => {
    console.log(res);
    return res.data;
  });
});

function MyApp({ Component, pageProps }: any) {
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
        <BoardThemeProvider>
          <AxiosInterceptor />
          <ToastContainer />
          <Component {...pageProps} />
        </BoardThemeProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;
