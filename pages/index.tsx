import React from "react";
import Layout from "../components/Layout";
import { getAllBoardsData, ALL_BOARDS_KEY } from "./../utils/queries";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { BoardsDisplay, useCompact } from "@bobaboard/ui-components";
import debug from "debug";

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
      boardData.forEach((board: any) => (board.has_updates = false));
      return boardData;
    },
    initialStale: true,
  });
  const router = useRouter();
  const divRef = React.createRef<HTMLDivElement>();
  const expandDiv = useCompact(divRef, 150, "#1c1c1c");

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
              <div className="updates" ref={divRef}>
                <h2>New Stuff </h2>
                <ul>
                  <li>
                    [7/10/20] Updates section goes down... updates section goes
                    up... (What I mean is, click on that arrow at the bottom to
                    expand)
                    <br />I hope with this update to have solved all our
                    notification woes. Please do let me know if notification or
                    "new comment/post" indicators don't act as you'd naturally
                    expect.
                  </li>
                  <li>
                    [7/09/20] Sorry for the intermittent troubles today! A bunch
                    of backend updates you won't even notice and... small
                    experimental update on displaying read replies with a more
                    subdued style. Onwards with better thread management!
                  </li>
                  <li>
                    [7/04/20] A lot of performance updates. And... did someone
                    mention "opening BOARDS in a new tab"?
                  </li>
                  <li>
                    [7/03/20] Yesterday's update broke everything. This is take
                    2.
                  </li>
                  <li>
                    [7/02/20] I've attempted some performance optimization. I
                    don't know if you'll see any difference in speed, but do
                    report if things break. I might push more performance
                    updates throughout the week so keep an eye out for
                    weirdness!
                  </li>
                  <li>
                    [7/01/20] It's tags time!!! They do nothing, really. But you
                    can chat in them! #what a userful feature #you're all
                    welcome
                    <em>
                      (I've temporarily hidden the threads dropdown as I fix a
                      bug.)
                    </em>
                  </li>
                </ul>
                {expandDiv}
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
                }))}
                onBoardClick={(slug: string) => {
                  router.push(`/[boardId]`, `/!${slug.replace(" ", "_")}`, {
                    shallow: true,
                  });
                }}
                getBoardHref={(slug: string) => `/!${slug.replace(" ", "_")}`}
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
              .updates {
                background-color: #1c1c1c;
                padding: 15px;
                border-radius: 25px;
                position: relative;
              }
              .updates :global(.expand-overlay) :global(svg) {
                margin-top: 15px;
              }
              .intro ul {
                list-style-position: inside;
                list-style-type: lower-greek;
                padding-left: 0px;
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
        onTitleClick={() => {}}
      />
    </div>
  );
}

export default HomePage;
