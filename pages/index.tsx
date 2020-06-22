import React from "react";
import Layout from "../components/Layout";
import { getAllBoardsData } from "./../utils/queries";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import {
  BoardsDisplay,
  // @ts-ignore
} from "@bobaboard/ui-components";
import debug from "debug";

const info = debug("bobafrontend:index-info");
info.enabled = true;

function HomePage() {
  const { data: allBoards } = useQuery("allBoardsData", getAllBoardsData);
  const router = useRouter();

  info(`Rerendering index with data:`);
  info(allBoards);
  return (
    <div className="main">
      <Layout
        mainContent={
          <div className="content">
            <div className="intro">
              <h1>Welcome to BobaBoard!</h1>
              <div className="tagline">
                "Where the bugs are funny and the people are cool" — Outdated
                Meme
              </div>
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
                    Stopping you all from murdering my baby by uploading too big
                    images/text.
                  </li>
                  <li>I'm overdue for a "squash all iOS bugs" focus day.</li>
                </ul>
              </p>
              <p>
                New:{" "}
                <ul>
                  <li>
                    It's pagination time! I swear, I will make sure the back
                    button brings you at the right place soon(ish), and refresh
                    doesn't make you lose your place. Keep pestering me for
                    this.
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
                  router.push(`/[boardId]`, `/!${slug.replace(" ", "_")}`, {
                    shallow: true,
                  });
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
              .tagline {
                font-style: italic;
                opacity: 0.9;
                margin-top: -10px;
                margin-bottom: 15px;
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
