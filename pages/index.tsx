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
                  [Last Updated: 11/07/20.{" "}
                  <Link href="/update-logs">
                    <a>Older logs.</a>
                  </Link>
                  ]
                  <p>
                    🇺🇸 🇺🇸 I can't make you happier than the news, but I can give
                    you some updates! 🇺🇸 🇺🇸{" "}
                    <ul>
                      <li>
                        <strong>Tons of fixes on the sidemenu:</strong> I had
                        gotten it to work, but CLEARLY not well enough. What you
                        get now: recent unreads are in the right order (with the
                        most recently updated displaying first), pinned boards
                        are also in the right order (by pinning time), and board
                        filtering is now case insensitive!
                      </li>
                      <li>
                        <strong>Better display for muted boards:</strong> people
                        have rightfully complained that the UI state for muted
                        boards wasn't clear enough. Well, not anymore
                        (hopefully)!
                      </li>
                      <li>
                        <strong>
                          (A Personal Fave) Board Preview on Linking:
                        </strong>{" "}
                        if you link a BobaBoard board or thread to a friend,
                        they'll now get the board image and description as part
                        of the preview. Fancy!
                      </li>
                      <li>
                        <strong>Fixed Special Roles:</strong> my work on
                        "improving" our board updates handling had messed up our
                        permission settings. While almost no one but me has
                        special permissions at this moment, just trust me that
                        it's working now.
                      </li>
                      <li>
                        <strong>Other bug fixes:</strong> setting a new username
                        should now be fixed. If you hadn't been able to change
                        it, please go ahead! CWs left alone on their own row are
                        now pushed to the topmost row. Improved spacing on
                        dropdown (but overlay is still not disappearing when
                        hiding posts... I've been temporarily bested, but I'll
                        try again tomorrow).
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
