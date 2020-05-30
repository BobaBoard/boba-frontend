import "@bobaboard/ui-components/dist/main.css";
import "normalize.css";

import axios from "axios";
axios.defaults.baseURL = "http://localhost:4200/";

import { AuthProvider } from "../components/Auth";

function MyApp({ Component, pageProps }: any) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
