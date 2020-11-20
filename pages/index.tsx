import React from "react";
import Layout from "../components/Layout";
import { BoardsDisplay } from "@bobaboard/ui-components";
import Link from "next/link";
import { BOARD_URL_PATTERN, createLinkTo } from "utils/link-utils";
import { useBoardContext } from "components/BoardContext";
import useBoos from "components/hooks/useBoos";

function HomePage() {
  const { styles } = useBoos();
  const { boardsData } = useBoardContext();

  return (
    <div className="main">
      <Layout
        mainContent={
          <div className="content">
            <div className="intro">
              <div className="title">
                <h1>Welcome to BobaBoard!</h1>
              </div>
              <div className="tagline">
                "Where the bugs are funny and the people are cool" — Outdated
                Meme
              </div>
              <p>
                Remember: this is the experimental version of an experimental
                website. If you experience a problem, then stuff is likely to be{" "}
                <em>actually broken</em>.
              </p>
              <p>
                Please do report bugs, thoughts and praise (seriously, gotta
                know what's working) in the{" "}
                <pre style={{ display: "inline" }}>#v0-report</pre> discord
                channel, the <pre style={{ display: "inline" }}>!bobaland</pre>{" "}
                board or the (even more) anonymous feedback form in the user
                menu.
              </p>
              <div className="updates">
                <h2>New Stuff </h2>
                <div className="last">
                  [Last Updated: 11/18/20.{" "}
                  <Link href="/update-logs">
                    <a>Older logs.</a>
                  </Link>
                  ]
                  <p>
                    <strong>Small Announcement 1:</strong> join other Boobies
                    for a{" "}
                    <a href="https://v0.boba.social/!animanga/thread/f9f075d5-50c6-4867-82e1-7e810cc28896/f841116e-5ca7-410d-a268-39d2fb042b9e">
                      Tokyo Babylon Watch Party
                    </a>{" "}
                    this Saturday November 21 @8PM <strong>EST</strong>.
                  </p>
                  <p>
                    <strong>Small Announcement 2:</strong> I will likely revert
                    avatars to their pre-halloween version soon. Say the
                    goodbyes you want to say.
                  </p>
                  <p>
                    <strong>Actual updates:</strong> After 3 days spent deep
                    into debugging thread performance I bring you... absolutely
                    unrelated bug fixes.
                    <ul>
                      <li>
                        <strong>Edit tags:</strong> only show the option to edit
                        your own tags. Not that you could edit other people's,
                        anyway, but you sure could have tried.
                      </li>
                      <li>
                        <strong>Sidemenu fixes:</strong> Fix sidescrolling issue
                        when board name is longer than the space allowed, and
                        fix bug on recent unreads where the last board you
                        visited always showed on top.
                      </li>
                      <li>
                        <strong>Post header updates:</strong> Improved
                        spacing/lettering of post headers. Also, posts in
                        gallery & timeline mode also have options dropdown now.
                      </li>
                      <li>
                        <strong>
                          Automatically show comments in timeline mode:
                        </strong>{" "}
                        What it says on the tin. Timeline mode will now always
                        show comments (while gallery only shows updated posts').
                      </li>
                      <li>
                        <strong>Other bug fixes:</strong> fixed "old images
                        added before a certain bug fix are hidden if they appear
                        at the end of a thread" (obscure, I know). Plus, a small
                        hidden change I don't expect you to find for a while :P
                      </li>
                    </ul>
                  </p>
                </div>
              </div>
            </div>
            <div className="display">
              <BoardsDisplay
                boards={Object.values(boardsData).map((board) => ({
                  slug: board.slug.replace("_", " "),
                  avatar: board.avatarUrl,
                  description: board.tagline,
                  color: board.accentColor,
                  updates: board.hasUpdates,
                  muted: board.muted,
                  link: createLinkTo({
                    urlPattern: BOARD_URL_PATTERN,
                    url: `/!${board.slug.replace(" ", "_")}`,
                  }),
                }))}
                minSizePx={180}
              />
            </div>
            {styles}
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
              .title {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 20px;
                margin-bottom: 10px;
              }
              .title h1 {
                margin: 0px 5px;
                line-height: 30px;
              }
              .title img:first-child {
                width: 45px;
                height: 45px;
              }
              .title img {
                width: 50px;
                height: 50px;
                z-index: 5;
              }
              @media only screen and (max-width: 400px) {
                h1 {
                  font-size: 25px;
                }
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
