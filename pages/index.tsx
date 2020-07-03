import React from "react";
import Layout from "../components/Layout";
import { getAllBoardsData, ALL_BOARDS_KEY } from "./../utils/queries";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import {
  BoardsDisplay,
  // @ts-ignore
} from "@bobaboard/ui-components";
import debug from "debug";

const info = debug("bobafrontend:index-info");

function HomePage() {
  // TODO: fix this typing
  // @ts-ignore
  const { data: allBoards } = useQuery("allBoardsData", getAllBoardsData, {
    initialData: () => {
      if (typeof localStorage !== "undefined") {
        // Localstorage is a client-only feature
        const data = localStorage.getItem(ALL_BOARDS_KEY);
        info(`Loaded data from localstorage: ${data}`);
        return data ? JSON.parse(data) : undefined;
      }
      return undefined;
    },
    initialStale: true,
  });
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
              <div className="updates">
                <h2>New Stuff </h2>
                <ul>
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
                  <li>
                    [6/29/20] Dropdowns dropDOWNS DROPDOOOWNS!! There's some new
                    dropdowns around. What do they do? Find out!{" "}
                    <em>
                      (*whispers* Among other things, they create a space to add
                      more options in the future.)
                    </em>
                  </li>
                  <li>
                    [6/22/20] Did someone casually mention "opening threads in
                    new tab" once? You're welcome ;)
                  </li>
                </ul>
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
