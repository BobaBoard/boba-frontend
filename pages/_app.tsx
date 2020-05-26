import "@bobaboard/ui-components/dist/main.css";

import App from "next/app";

function MyApp({ Component, pageProps } : any) {
    return <Component {...pageProps} />;
  }
  MyApp.getInitialProps = async (appContext: any) => {
    // calls page's `getInitialProps` and fills `appProps.pageProps`
    const appProps = await App.getInitialProps(appContext);
  
    return { ...appProps }
  }

export default MyApp;
