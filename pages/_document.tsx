import Document, { Html, Head, Main, NextScript } from "next/document";

// @ts-ignore
import { flush as componentsFlush } from "@bobaboard/ui-components";

const bodyCss = `
  body {
    font-family: "Inter", sans-serif;
    background-color: rgb(47, 47, 48);
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: #131518 #2f2f30;
  }
  *::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }

  *::-webkit-scrollbar {
    width: 10px;
    background-color: #2f2f30;
  }

  *::-webkit-scrollbar-thumb {
    border-radius: 15px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #131518;;
  }`;

class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    const initialProps = await Document.getInitialProps(ctx);
    const externalStyles = componentsFlush() as any;
    return { ...initialProps, externalStyles };
  }

  render() {
    return (
      <Html>
        <Head>
          {
            // @ts-ignore
            this.props.externalStyles
          }
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          ></meta>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600&display=swap"
            rel="stylesheet"
          />
          <script
            id="twitter-wjs"
            type="text/javascript"
            async
            defer
            src="//platform.twitter.com/widgets.js"
          ></script>
          <style
            type="text/css"
            dangerouslySetInnerHTML={{ __html: bodyCss }}
          />
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
