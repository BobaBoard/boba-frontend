import React from "react";
import Layout from "../components/Layout";

function HomePage() {
  return (
    <div className="main">
      <Layout
        mainContent={
          <div className="main">
            <h1>Welcome to BobaBoard!</h1>
            <p>I haven't implemented this main page yet! Woops.</p>
            <p>
              Please open the menu to the side and click on a board to get
              started.
            </p>
            <style jsx>{`
              .main {
                margin: 20px auto;
                width: 100%;
                color: white;
                text-align: center;
              }
            `}</style>
          </div>
        }
        title={`Hello!`}
        onTitleClick={() => {}}
      />
    </div>
  );
}

export default HomePage;
