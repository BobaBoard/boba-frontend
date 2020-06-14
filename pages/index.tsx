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
                website. If you experience a problem, then stuff is likely to be{" "}
                <em>actually broken</em>.
              </p>
              <p>
                Please do report bugs, thoughts and praise (seriously, gotta
                know what's working) in the{" "}
                <pre style={{ display: "inline" }}>#v0-report</pre> discord
                channel or the{" "}
                <pre style={{ display: "inline" }}>!bobaland</pre> board.
              </p>
              <p>
                Most pressing issues:{" "}
                <ul>
                  <li>Top header needs more compact mobile display.</li>
                  <li>Wonky random refresh when switching boards/threads.</li>
                  <li>
                    There's no pagination <s>until some time tomorrow :P</s> I'm
                    a liar, no pagination until it's evident we'll soon die
                    without it
                  </li>
                  <li>
                    Stopping you all from murdering my baby by uploading too big
                    images/text.
                  </li>
                </ul>
              </p>
              <p>
                New:{" "}
                <ul>
                  <li>
                    NOTIFICATIONS ARE FIXED. But you have to enter a thread to
                    mark it as visited even if you've seen its only post on your
                    dash. Sorry about that. I'll fix it, but not today.
                  </li>
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
                onBoardClick={(slug: string) => {
                  router.push(`/[boardId]`, `/!${slug.replace(" ", "_")}`);
                }}
              />
            </div>
            <style jsx>{`
              .intro {
                max-width: 600px;
                margin: 0 auto;
                margin-bottom: 25px;
                line-height: 20px;
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
