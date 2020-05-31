import "@bobaboard/ui-components/dist/main.css";
import "normalize.css";

import React from "react";
import axios from "axios";
import { AuthProvider, useAuth } from "../components/Auth";

axios.defaults.baseURL = "http://localhost:4200/";
let axiosAwaitLoginPromise: Promise<string | null>;
let promisePending = false;
let resolveLoginPromise: (idToken: string | null) => void;
axios.interceptors.request.use((config) => {
  return axiosAwaitLoginPromise.then((idToken) => {
    config.headers = {
      "Content-Type": "application/json",
      Authorization: idToken,
    };
    return config;
  });
});

const AxiosInterceptor = () => {
  const { idToken, isPending } = useAuth();
  React.useEffect(() => {
    if (isPending && !promisePending) {
      axiosAwaitLoginPromise = new Promise((resolve) => {
        resolveLoginPromise = resolve;
      });
      promisePending = true;
    } else if (promisePending) {
      resolveLoginPromise && resolveLoginPromise(idToken);
    }
  }, [idToken, isPending]);
  return null;
};

function MyApp({ Component, pageProps }: any) {
  return (
    <AuthProvider>
      <AxiosInterceptor />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
