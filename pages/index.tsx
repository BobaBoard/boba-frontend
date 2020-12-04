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
                  [Last Updated: 11/30/20.{" "}
                  <Link href="/update-logs">
                    <a>Older logs.</a>
                  </Link>
                  ]
                  <p>
                    <strong>Small Announcement:</strong> If you haven't already
                    read the{" "}
                    <a href="https://v0.boba.social/!bobaland/thread/61ba9b68-77e6-47ba-93d4-324702937649">
                      announcement in !bobaland
                    </a>{" "}
                    (heed the content notices), just know I'm temporarily
                    focusing on some personal issues and updates will be slower
                    and more "serendipitous" for (hopefully just) a couple
                    weeks.
                  </p>
                  <p>
                    Speaking of serendipitous updates, I've made two changes
                    I've been thinking about for a while:
                    <ul>
                      <li>
                        <strong>
                          <u>NEW TAGS SHORTCUTS:</u>
                        </strong>{" "}
                        I know a lot of you had already gotten used to ! for
                        searchable tags, but I decided to do a switcharoo and
                        change it to... <strong>#</strong>. There was really no
                        reason for the whispertags to have that symbol, and this
                        will curb down confusion for newcomers. Rest assured{" "}
                        <strong>!</strong> will also find its place: I'm
                        currently thinking of using it to crosspost between
                        different boards.{" "}
                        <u>
                          All previous posts have automatically had their tags
                          changed, without you needing to do anything.
                        </u>
                      </li>
                      <li>
                        <strong>
                          <u>NEW TAGS SHORTCUTS (2):</u>
                        </strong>{" "}
                        <strong>cw:</strong> has been renamed into{" "}
                        <strong>cn:</strong>. You can still use{" "}
                        <strong>cw:</strong>, and even <strong>squick:</strong>{" "}
                        (or <strong>sq:</strong>), but it will automatically
                        change to cn as that is the "canonical".
                      </li>{" "}
                      <li>
                        <strong>Tumblr-style full-width images:</strong> I've
                        changed the way posts display, so now images and embed
                        span the whole width of the post (kinda like they do on
                        Tumblr). *clenches fist* *cries* it looks so good...
                      </li>
                      <li>
                        <strong>12/2/20 SPECIAL:</strong>We now have realm-wide
                        roles and you can post as special identities in comments
                        too! Not doing a separate update because... well, it's
                        just for me :P
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
