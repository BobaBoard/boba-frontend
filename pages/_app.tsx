import "@bobaboard/ui-components/dist/main.css";
import "normalize.css";

import React from "react";
import axios from "axios";
import { AuthProvider, useAuth } from "../components/Auth";
// @ts-ignore
import {
  ToastContainer,
  toast,
  setTumblrEmbedFetcher,
} from "@bobaboard/ui-components";

let location;
if (typeof window !== "undefined") {
  location = window.location.hostname;
}

axios.defaults.baseURL =
  process.env.NODE_ENV == "production"
    ? "https://backend-dot-bobaboard.uc.r.appspot.com/"
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
    <AuthProvider>
      <AxiosInterceptor />
      <ToastContainer />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
