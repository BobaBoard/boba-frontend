import Document, { Html, Head, Main, NextScript } from "next/document";

import { flush as componentsFlush } from "@bobaboard/ui-components";

const bodyCss = `
body {
    font-family: "Inter", sans-serif;
    overflow: hidden;
    background-color: rgb(47, 47, 48);
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
