import Layout from "components/core/layouts/Layout";
import React from "react";

function NotFoundPage() {
  return (
    <Layout title={"Wooops!"}>
      <Layout.MainContent>
        <div className="main">
          <img src="/error.png" />
          <h2>The page you tried to reach was not found on this server!</h2>
          <style jsx>{`
            .main {
              color: white;
              width: 100%;
              text-align: center;
              padding: 50px 20px;
            }
          `}</style>
        </div>
      </Layout.MainContent>
    </Layout>
  );
}

export default NotFoundPage;
