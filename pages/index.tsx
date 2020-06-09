import React from "react";
import Layout from "../components/Layout";
import { getAllBoardsData } from "./../utils/queries";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import {
  BoardsDisplay,
  // @ts-ignore
} from "@bobaboard/ui-components";

function HomePage() {
  const { data: allBoards } = useQuery("allBoardsData", getAllBoardsData);
  const router = useRouter();
  return (
    <div className="main">
      <Layout
        mainContent={
          <div className="content">
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
                  <li>There's no pagination until some time tomorrow :P</li>
                  <li>Board description hidden on mobile landing page.</li>
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
                onBoardClick={(slug) => {
                  router.push(`/[boardId]`, `/!${slug.replace(" ", "_")}`);
                }}
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
                padding: 15px;
                border-radius: 25px;
              }
              .intro ul li {
                padding-bottom: 5px;
              }
              .content {
                color: white;
                text-align: center;
                margin: 0 auto;
                padding: 20px;
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
