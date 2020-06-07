import "@bobaboard/ui-components/dist/main.css";
import "normalize.css";
import "react-toastify/dist/ReactToastify.css";

import React from "react";
import axios from "axios";
import { AuthProvider, useAuth } from "../components/Auth";
import { ToastContainer } from "react-toastify";

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
      console.log("waiting on token: ", config.url);
      return getAuthIdToken().then((idToken: string) => {
        console.log("gotten token for: ", config.url, idToken);
        config.headers.authorization = idToken;
        return config;
      });
    });
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
