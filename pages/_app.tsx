import "@bobaboard/ui-components/dist/main.css";
import "normalize.css";
import "react-toastify/dist/ReactToastify.css";

import React from "react";
import axios from "axios";
import { AuthProvider, useAuth } from "../components/Auth";
import { ToastContainer } from "react-toastify";

axios.defaults.baseURL = "http://localhost:4200/";
let promisePending = true;
let resolveLoginPromise: (idToken: string | null) => void;
let axiosAwaitLoginPromise: Promise<string | null> = new Promise((resolve) => {
  resolveLoginPromise = resolve;
});
axios.interceptors.request.use((config) => {
  return axiosAwaitLoginPromise.then((idToken) => {
    config.headers.authorization = idToken;
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
    } else if (!isPending && promisePending) {
      console.log(idToken);
      resolveLoginPromise && resolveLoginPromise(idToken);
    }
  }, [idToken, isPending]);
  return null;
};

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
