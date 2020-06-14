import "@bobaboard/ui-components/dist/main.css";
import "normalize.css";

import React from "react";
import axios from "axios";
import { AuthProvider, useAuth } from "../components/Auth";
import { ToastContainer, toast } from "@bobaboard/ui-components";

axios.defaults.baseURL =
  process.env.NODE_ENV == "production"
    ? "https://backend-dot-bobaboard.uc.r.appspot.com/"
    : "http://localhost:4200/";

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
        console.log(err);
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
