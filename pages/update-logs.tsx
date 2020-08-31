import React from "react";
import Layout from "../components/Layout";

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
                  [8/25/20]
                  <ul>
                    <li>
                      I heard you like direct links to specific posts...
                      (pppsstt: click on the posts timestamps)
                    </li>
                  </ul>
                </li>

                <li>
                  [8/19/20]
                  <p>Today..... the editor rises!</p>
                  <ul>
                    <li>
                      [New Embed Types]: Pixiv, Reddit, Instagram and Vimeo!
                    </li>
                    <li>
                      [Embeds Size Saving]: We're now saving the size of the
                      embeds, so you shouldn't see (for new posts) as much
                      jumping around as the embeds load. This is a bit
                      experimental. Cross your fingers.
                    </li>
                    <li>
                      [Removing Extra White Lines]: Extra white lines at the end
                      are now automatically removed.
                    </li>
                    <li>
                      [Bug Fix 1]: Fixed bug with link auto-highlighting, where
                      a simple www would result in the following word being
                      marked as link.
                    </li>
                    <li>
                      [Bug Fix 2]: You can now right click to save images even
                      when they're marked as spoilers!
                    </li>
                    <li>
                      [Bug Fix 3]: Removing an embed while it's still loading is
                      now enabled.
                    </li>
                    <li>
                      [Bug Fix 4]: re-enable copy paste that was broken in some
                      iOS versions, and re-enabled the pasting of images, which
                      was broken in other browsers.
                    </li>
                  </ul>
                </li>
                <li>
                  [8/15/2020]
                  <ul>
                    <li>
                      [Category Tags]: you can prefix tags with + to turn them
                      into category tags. Category tags will be searchable only
                      within the context of a board or of a thread. Want to add
                      a +Luigi category to your "fictional husbands" shrine
                      without having every single post show up in search? Now
                      you can.
                    </li>
                    <li>
                      [Content Warning Tags]: you can prefix tags with "cw:" to
                      turn them into content warning tags. Other than a swanky
                      yellow color that makes them more visible, I plan to have
                      a couple features around them in the future, like showing
                      them at the top of the post instead, or making sure
                      synonyms are taken into account when deny-listing them.
                    </li>
                  </ul>
                </li>
                <li>
                  [8/12/2020]
                  <ul>
                    <li>
                      [Comment threads] We need to go deeper... It's time to
                      start threading comments too!
                    </li>
                  </ul>
                </li>
                <li>
                  [8/8/20]
                  <ul>
                    <li>
                      [Comments chains] Started a comment but space is running
                      out? Chain another one!
                    </li>
                    <li>
                      [Append Contribution] Want to add another contribution to
                      a specific thread? You can now do so directly from the end
                      of the thread. No need to beam up!
                    </li>
                  </ul>
                </li>
                <li>
                  [8/5/20]
                  <ul>
                    <li>Quit my job!</li>
                    <li>
                      Fixed "go to new comments/contributions" offset bug.
                    </li>
                    <li>
                      Changed spacing of comments. Longer comments should be
                      much more readable now.
                    </li>
                    <li>
                      ...especially important cause now you have{" "}
                      <strong>300 characters for comments</strong>.
                    </li>
                    <li>
                      Also, the secret identity avatar assigned in each thread
                      will now be visible alongside your real avatar.
                    </li>
                  </ul>
                </li>
                <li>
                  [8/02/2020] Completely changed the underlying HTML/CSS layout
                  structure. You will see a bunch of improvements all around
                  (e.g. address bar on mobile should disappear, scroll position
                  on page change should work way better).
                  <br />
                  <strong>Stuff is also likely to have broken.</strong> Please
                  do report anything that's not working right.
                </li>
                <li>
                  [7/28/2020]
                  <ul>
                    <li>New options for threads: hide & mute.</li>
                    <li>Older logs now hidden in the user menu.</li>
                  </ul>
                </li>
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
        title={`Logs Archive`}
        onTitleClick={() => {}}
      />
    </div>
  );
}

export default HomePage;
