import "@bobaboard/ui-components/dist/main.css";
import axios from "axios";
axios.defaults.baseURL = "http://localhost:4200/";

function MyApp({ Component, pageProps }: any) {
  return <Component {...pageProps} />;
}

export default MyApp;
