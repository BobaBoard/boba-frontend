import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

import { flush as componentsFlush } from "@bobaboard/ui-components";

import debug from "debug";
const info = debug("bobafrontend:Document-info");
info.enabled = false;

class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    info(ctx);
    const initialProps = await Document.getInitialProps(ctx);
    const externalStyles = componentsFlush() as any;
    return {
      ...initialProps,
      styles: (
        <>
          {externalStyles}
          {initialProps.styles}
        </>
      ),
    };
  }

  render() {
    info(`Rendering document`);
    return (
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
            rel="stylesheet"
          />
          <script
            id="twitter-wjs"
            type="text/javascript"
            async
            defer
            src="//platform.twitter.com/widgets.js"
          ></script>
          <style>{`
            html {
              font-size: 62.5%;
              --font-size-regular: 1.6rem;
              --font-size-small: 1.3rem;
              --font-size-large: 1.8rem;
            }
            body {
              font-family: Inter, sans-serif;
              background-color: rgb(47, 47, 48);
            }
            * {
              scrollbar-width: thin;
              scrollbar-color: #2f2f30 #1c1c1c;
            }
            *::-webkit-scrollbar-track {
              -webkit-box-shadow: inset 0 0 5px 0px #2f2f30;
              border-radius: 10px;
            }

            *::-webkit-scrollbar {
              width: 10px;
              background-color: #1c1c1c;
            }

            *::-webkit-scrollbar-thumb {
              border-radius: 15px;
              -webkit-box-shadow: inset 0 0px 2px 1px #1c1c1c;
              background-color: #5a5a5ad6;
            }
        `}</style>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
