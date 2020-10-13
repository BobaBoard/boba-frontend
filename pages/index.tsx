import React from "react";
import Layout from "../components/Layout";
import { getAllBoardsData, ALL_BOARDS_KEY } from "./../utils/queries";
import { useQuery } from "react-query";
// @ts-ignore
import { BoardsDisplay, useCompact } from "@bobaboard/ui-components";
import Link from "next/link";
import debug from "debug";
import { BOARD_URL_PATTERN, createLinkTo } from "utils/link-utils";

const info = debug("bobafrontend:index-info");

function HomePage() {
  const { data: allBoards } = useQuery("allBoardsData", getAllBoardsData, {
    initialData: () => {
      if (typeof localStorage === "undefined") {
        return undefined;
      }
      // Localstorage is a client-only feature
      const data = localStorage.getItem(ALL_BOARDS_KEY);
      if (!data) {
        return undefined;
      }
      const boardData = JSON.parse(data);
      if (!boardData.forEach) {
        // Something weird got saved here!
        return undefined;
      }
      boardData.forEach((board: any) => (board.has_updates = false));
      return boardData;
    },
    initialStale: true,
  });

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
              <div className="updates">
                <h2>New Stuff </h2>
                <div className="last">
                  [Last Updated: 10/12/20.{" "}
                  <Link href="/update-logs">
                    <a>Older logs.</a>
                  </Link>
                  ]
                  <p>
                    More stuff!!! More stuff!!!
                    <ul>
                      <li>
                        Reworked mobile (and more) design of galleries +
                        timeline views. If you try them out, let me know what
                        you think! These are not as polished as threads, so do
                        test them out and suggest improvements (and if you want
                        me to change the default view of a old thread... by all
                        means, let me know)!
                      </li>
                      <li>
                        A very requested feature that was extremely hard to get
                        right (and I'm still unsure about its "perfection"). You
                        will now be asked for confirmation when:
                        <ul>
                          <li>
                            You hit cancel on a post/comment you're in the
                            middle of writing (easy).
                          </li>
                          <li>
                            You navigate away from a page with the editor open
                            (I have literally spat blood).
                          </li>
                        </ul>
                      </li>
                      <li>
                        [Bug Fixes] Finally.... After months of pain..... The
                        board name won't overlap the login button on small
                        screens...... Oh, and also "mark visited" should
                        immediately clear the notifications without refresh.
                      </li>
                      <li>
                        [Restyling] Still working on tags, small changes to
                        columns... blahblahblah. I forget all I did.
                      </li>
                    </ul>
                  </p>
                </div>
              </div>
            </div>
            <div className="display">
              <BoardsDisplay
                boards={(allBoards || []).map((board: any) => ({
                  slug: board.slug.replace("_", " "),
                  avatar: board.avatarUrl,
                  description: board.tagline,
                  color: board.settings?.accentColor,
                  updates: board.has_updates,
                  link: createLinkTo({
                    urlPattern: BOARD_URL_PATTERN,
                    url: `/!${board.slug.replace(" ", "_")}`,
                  }),
                }))}
                minSizePx={180}
              />
            </div>
            <style jsx>{`
              .intro {
                max-width: 600px;
                margin: 0 auto;
                margin-bottom: 25px;
                line-height: 20px;
              }
              a {
                color: #f96680;
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
              .updates {
                background-color: #1c1c1c;
                padding: 15px;
                border-radius: 25px;
                position: relative;
              }
              .updates .last {
                font-size: small;
                margin-bottom: 5px;
              }
              .updates :global(.expand-overlay) :global(svg) {
                margin-top: 15px;
              }
              .intro ul {
                list-style-position: inside;
                list-style-type: lower-greek;
                padding-left: 0px;
              }
              .intro ul ul {
                padding-left: 10px;
                list-style-type: circle;
              }
              .intro ul ul li {
                padding-bottom: 5px;
              }
              .intro ul li {
                padding-bottom: 10px;
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
      />
    </div>
  );
}

export default HomePage;
