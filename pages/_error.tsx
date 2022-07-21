import { Button, toast } from "@bobaboard/ui-components";

import { NextPage } from "next";
import React from "react";
import { useError } from "@stefanprobst/next-error-boundary";

interface ErrorPageProps {
  err?: string;
  statusCode?: number;
  stack?: string;
}

const ErrorPage: NextPage<ErrorPageProps> = (props) => {
  const trace = `Error (code: ${props.statusCode})\n${props.err}\n${props.stack}`;
  return (
    <div className="error-page">
      <h1>
        {props.statusCode
          ? `Server Error (${props.statusCode})`
          : "Client Error"}
      </h1>
      <img src="/error.png" />
      <p>
        Something went <em>very</em> wrong! Please{" "}
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSfyMENg9eDNmRj-jIvIG5_ElJFwpGZ_VPvzAskarqu5kf0MSA/viewform">
          report the following stack trace
        </a>
        :<pre>{trace}</pre>
      </p>
      <Button
        onClick={() => {
          const tempInput = document.createElement("textarea");
          tempInput.value = trace;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand("copy");
          document.body.removeChild(tempInput);
          toast.success("Error copied!");
        }}
      >
        Copy error
      </Button>
      <style jsx>{`
        .error-page {
          display: flex;
          flex-direction: column;
          margin: 15px 20px;
          color: white;
          align-items: center;
        }
        h1 {
          font-variant: all-small-caps;
          font-size: 5rem;
          margin: 15px;
          margin-bottom: 20px;
          text-align: center;
        }
        img {
          max-width: 80%;
          width: max-content;
        }
        p {
          text-align: center;
          max-width: 100%;
        }
        a {
          color: #dab041;
        }
        pre {
          max-width: min(80%, 800px);
          background-color: lightgray;
          overflow: scroll;
          padding: 15px 20px;
          color: black;
          margin: 15px auto;
          text-align: left;
        }
      `}</style>
    </div>
  );
};

ErrorPage.getInitialProps = async ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, err: err?.message, stack: err?.stack };
};

export default ErrorPage;

export function CustomErrorPage() {
  const { error } = useError();
  // @ts-expect-error
  return <ErrorPage err={error.message} stack={error.stack} />;
}
