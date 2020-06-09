import React from "react";
import Layout from "../components/Layout";
import { getAllBoardsData } from "./../utils/queries";
import { useQuery } from "react-query";
import {
  BoardsDisplay,
  // @ts-ignore
} from "@bobaboard/ui-components";

function HomePage() {
  const { data: allBoards, refetch } = useQuery(
    "allBoardsData",
    getAllBoardsData
  );
  return (
    <div className="main">
      <Layout
        mainContent={
          <div className="main">
            <div className="intro">
              <h1>Welcome to BobaBoard!</h1>
              <img src="/under_construction.gif" />
              <p>
                Remember: this is the experimental version of an experimental
                website. If you experience a problem, then stuff is most likely{" "}
                <em>actually broken</em>.
              </p>
              <p>
                Feel free to report bugs, thoughts and praise (seriously, gotta
                know what's working) in the{" "}
                <pre style={{ display: "inline" }}>#v0-report</pre> discord
                channel or the [appropriate] board.
              </p>
              <p>
                Most pressing issues:{" "}
                <ul>
                  <li>Notifications for updates are not always accurate.</li>
                  <li>Top header needs more compact mobile display.</li>
                  <li>Wonky random refresh when switching boards/threads.</li>
                </ul>
              </p>
            </div>
            <div className="display">
              <BoardsDisplay
                boards={(allBoards || []).map((board: any) => ({
                  slug: board.slug.replace("_", " "),
                  avatar: board.avatarUrl,
                  description: board.tagline,
                  color: board.settings?.accentColor,
                  updates: board.has_updates,
                }))}
                onBoardClick={(slug) => {}}
              />
            </div>
            <style jsx>{`
              .intro {
                max-width: 600px;
                margin: 0 auto;
                margin-bottom: 25px;
              }
              .intro img {
                height: 100px;
              }
              .intro ul {
                list-style-position: inside;
                list-style-type: lower-greek;
                background-color: #1c1c1c;
                padding: 10px;
                border-radius: 25px;
              }
              .main {
                margin: 20px auto;
                width: 100%;
                color: white;
                text-align: center;
              }
              .display {
                max-width: 800px;
                width: 90%;
                margin: 0 auto;
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
