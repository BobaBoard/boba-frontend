import React from "react";
import Layout from "../components/Layout";
import debug from "debug";

const info = debug("bobafrontend:index-info");

function HomePage() {
  return (
    <div className="main">
      <Layout
        mainContent={
          <div className="content">
            <div className="intro updates">
              <h1>Update Logs!</h1>
              <ul>
                <li>
                  [7/23/20] The constant reload of embeds at inappropriate times
                  should be fixed once and for all. Forgive me for the trouble,
                  I had angered the programming gods by being, well, an idiot.
                </li>
                <li>
                  [7/22/20] Try the small experimental new button on threads
                  that will cycle you through all the new contribution. UX has a
                  lot to improve, but I wanted to give it to you as soon as
                  possible!
                </li>
                <li>
                  [7/21/20] Exactly 20 days after tags first appeared... we have
                  indexable tags! Simply type ! at the beginning of a tag to
                  make it searchable at some point in the future. Yeah, I mean,
                  I said we had indexable tags, not USEFUL indexable tags.
                </li>
                <li>
                  [7/19/20] [PLEASE READ] A bunch of "crossing fingers I don't
                  murder the whole website" updates:
                  <ul>
                    <li>
                      I added the top-right dropdown on board threads again. If
                      any of you gets flickering again, let me know so you can
                      help me get at the bottom of it.
                    </li>
                    <li>
                      The library I'm using for query caching has a bug, and I
                      solved it by re-implementing "load next board page" from
                      scratch. Hopefully this fixes duplicates posts and doesn't
                      break anything new.
                    </li>
                    <li>
                      Beam me up, Scotty! You can now click on the thread balls
                      to go back up and answer more quickly. This update gave me
                      the impression of causing degraded performance on thread
                      rendering, which I didn't have time to investigate fully.
                      I'll do more testing in the next days.
                    </li>
                    <li>
                      Updated tags logic in preparation for indexed tags. If you
                      notice problems, you know where to go.
                    </li>
                  </ul>
                </li>
                <li>[7/14/20] [Spoilers Warning] We have spoilers now.</li>
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
                  [7/03/20] Yesterday's update broke everything. This is take 2.
                </li>
                <li>
                  [7/02/20] I've attempted some performance optimization. I
                  don't know if you'll see any difference in speed, but do
                  report if things break. I might push more performance updates
                  throughout the week so keep an eye out for weirdness!
                </li>
                <li>
                  [7/01/20] It's tags time!!! They do nothing, really. But you
                  can chat in them! #what a userful feature #you're all welcome
                  <em>
                    (I've temporarily hidden the threads dropdown as I fix a
                    bug.)
                  </em>
                </li>
              </ul>
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
        onTitleClick={() => {}}
      />
    </div>
  );
}

export default HomePage;
