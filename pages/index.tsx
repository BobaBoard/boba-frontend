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
                  [Last Updated: 11/14/20.{" "}
                  <Link href="/update-logs">
                    <a>Older logs.</a>
                  </Link>
                  ]
                  <p>
                    The harbringer of good updates to come.
                    <ul>
                      <li>
                        <strong>Edit tags:</strong> yes, you can edit post tags
                        now! Get hype for this extremely basic piece of
                        functionality. (If you haven't heard about the reason
                        we're getting this now... well, I'll let you guess why
                        this has suddenly become more urgent). Temporarily only
                        available in thread & single post view.
                      </li>
                      <li>
                        <strong>Edit default thread view:</strong> did you
                        regret not making a thread be a gallery or a timeline?
                        Not anymore!
                      </li>
                      <li>
                        <strong>Partial Load on Galleries & Timelines:</strong>{" "}
                        gallery and timeline view will now load posts in
                        batches, loading more as you scroll down. Paired with
                        the update above, it should make it possible to once
                        again reopen some really long threads (until I get
                        performance REALLY under control).
                      </li>
                      <li>
                        <strong>Copy link on inner posts:</strong> ever wanted
                        to link someone to a specific post? Now you can do it
                        from within the post's menu!
                      </li>
                      <li>
                        <strong>Other bug fixes:</strong> the dropdown overlay
                        should now disappear when hiding threads. If I fixed
                        anything else, I forgot.
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
