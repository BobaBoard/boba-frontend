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
                  [20/12/20]
                  <ul>
                    <li>
                      [DISCORD NOTIFICATIONS] As seen in !bobaland, Discord
                      servers can now receive feed updates when threads are
                      created in certain categories. This is just for the
                      webmaster's exclusive set up for now, but will be
                      configurable by everyone in the future.
                    </li>
                    <li>
                      [LOCKED BOARDS] Boards can now be logged in only!
                      !volunteers is the first of such type. (!salt will likely
                      soon follow, as discussed in the past.)
                    </li>
                    <li>
                      [NOTIFICATIONS] We now have a concept of "outdated"
                      notifications. That is, if you've visited a board without
                      clearing notifications, and NO NEW UPDATE has happened
                      since then, the notification dot color will be darker. If
                      no new update has happened on any board, but notifications
                      are still present, the menu red notification will turn
                      white. This is somewhat experimental, let me know what you
                      think.
                    </li>
                    <li>
                      [YEETING] Click on dabbing bobatan to get yeeted to the
                      top of the thread.
                    </li>
                    <li>
                      [RANDOM FIXES] Fixed index page decorations on iOS, right
                      margin spacing on lists, and removed muted threads from
                      personal feeds.
                    </li>
                  </ul>
                </li>
                <li>
                  [13/12/20]
                  <p>Happy holidays!</p>
                </li>
                <li>
                  [12/12/20]
                  <ul>
                    <li>
                      <strong>Post from anywhere:</strong> you don't have to
                      decide where to post something before starting to type!
                      From now on, you can select the right board *after* the
                      post is written and done!
                    </li>
                    <li>
                      <strong>
                        Reverted the icons to the pre-Halloween theme:
                      </strong>{" "}
                      what it says there. Goodnight, sweet princes & princesses
                      & other assorted royalty.
                    </li>
                    <li>
                      <strong>Bug fixes:</strong> readded text selection (oops),
                      personal feed can now go beyond one single page, and the
                      home/board buttons are present at all sizes.
                    </li>
                  </ul>
                </li>
                <li>
                  [12/06/20]{" "}
                  <ul>
                    <li>
                      <strong>Swipe to open side menu:</strong> we're officially
                      living in the future. I also reworked how the opening
                      animation works, so it should be more performant than
                      before.
                    </li>
                    <li>
                      <strong>Updated header bar:</strong> the updates indicator
                      is now single-color, and the buttons and spacing have been
                      reworked. You'll notice a new "compass" button on mobile
                      that you can use to... -{">"}
                    </li>
                    <li>
                      <strong>Easily bring up the sidebar on mobile:</strong>{" "}
                      you can easily open the contextual sidebar while mobile
                      browsing no matter where you are! Try it on threads or the
                      personal feed.
                    </li>
                    <li>
                      <strong>Personal feed filters:</strong> you can now select
                      whether you want to display only the updated threads in
                      "feed view", or even just the ones you originated. The UX
                      isn't great yet, so expect (and suggest) improvements.
                    </li>
                  </ul>
                </li>
                <li>
                  [11/30/20]
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
                </li>
                <li>
                  [11/18/20]
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
                </li>
                <li>
                  [11/14/20]
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
                </li>
                <li>
                  [11/07/20]
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
                </li>
                <li>
                  [11/04/20]
                  <p>
                    The Halloween decorations are gone... so dry your tears with
                    these cool updates!
                    <ul>
                      <li>
                        <strong>
                          New side menu! New side menu! New side menu!
                        </strong>{" "}
                        We're officially in a glorious and radiant future in
                        which our sidemenu is actually decent. Thank you for
                        putting up with my previous "hastily-thrown together"
                        one for so long.
                      </li>
                      <li>
                        <strong>Board pinning!</strong> See that empty space on
                        the left of your shiny new menu? Pinned boards go there.
                        You can find the option in the boards' sidebar dropdown.
                      </li>
                      <li>
                        <strong>Server Side Rendering</strong> I've begun taking
                        the first step into pre-rendering pages on the server.
                        What this will mean in the future is improved loading
                        times for all of us (plus some cool bonuses you'll learn
                        about with time). But what this means for now is that
                        you won't see the board color flash from pink to the
                        actual one on first load ever again.
                      </li>
                      <li>
                        <strong>Server Cache</strong> I'm now caching the
                        results of some database queries, which means I won't
                        recalculate them every single time. This should lead,
                        with time, to better and better load times. And also,
                        very likely, to a bunch of bugs along the way (caching
                        is hard).
                      </li>
                      <li>
                        <strong>Small fixes:</strong> Fixed YouTube embeds from
                        youtu.be. You should now be able to add from any YouTube
                        url.
                      </li>
                    </ul>
                  </p>
                </li>
                <li>
                  [10/30/20]
                  <p>
                    Bug fixes & Announcements!
                    <ul>
                      <li>
                        <strong>
                          Join us for our Boba Horror Picture Show watch
                          together
                        </strong>{" "}
                        on October 31st at 1PM and 3PM PST!{" "}
                        <a href="https://v0.boba.social/!bobaland/thread/eb77813b-5f59-47e1-ae72-4e6ff705ccd6">
                          Details on !bobaland.
                        </a>
                      </li>
                      <li>
                        Our userbase is increasing and the database is dying.{" "}
                        Sorry for our slower-than-usual loading times! I'll be
                        doing some performance work in the following days.
                        🤞🤞🤞
                      </li>
                      <li>
                        <strong>LIMITED TIME SPECIAL:</strong> I improved the
                        "popping" boos animation.
                      </li>
                      <li>
                        Editor spacing has been improved again. It's a bit
                        workaround-y in that I'm trying to simulate "line break"
                        on one new line, "paragraph break" on two consecutive
                        new lines without that being supported by our editor.
                        Boba girls make do.
                      </li>
                      <li>
                        <strong>Small fixes:</strong> Backdrop overlapping board
                        description on mobile, changed look of login text
                        fields, avatars "cutouts" are now actually transparent,
                        and I added some extra padding at the bottom of threads
                        so the "new comment" button won't overlap the reply one.
                      </li>
                    </ul>
                  </p>
                </li>
                <li>
                  [10/22/20]
                  <p>
                    Mostly cosmetic changes
                    <ul>
                      <li>
                        Changed look & feel of dropdown, especially on mobile
                        (say thanks to the contractor!).
                      </li>
                      <li>
                        You can now click on category tags to filter by them on
                        boards. This works even when that category is not
                        "showcased" in the sidebar.
                      </li>
                      <li>
                        Added "welcome guide link" on dropdown and invite page.
                        Oops!
                      </li>
                      <li>
                        Muted boards will now appear muted also on main page.
                        Better mute indicator upcoming.
                      </li>
                      <li>
                        Personal feed link is now hidden for non-logged in
                        users.......
                      </li>
                      <li>Fixed paragraph spacing for posts on boards.</li>
                    </ul>
                  </p>
                </li>
                <li>
                  [10/20/20]
                  <p>Quick & Dirty, late at night:</p>
                  <ul>
                    <li>
                      Look at your top right (or, if on mobile, to your side
                      menu)... We now have a feed of everything you've
                      participated in! Extremely basic functionality for now,
                      but expect more and more things there (and feel free to
                      suggest ideas)!
                    </li>
                    <li>
                      I have indeed moved CWs up before the post. We'll see how
                      that goes.
                    </li>
                    <li>
                      If you've been using category tags in a thread, you'll now
                      get them as suggestion in new posts!
                    </li>
                    <li>
                      And last... because people asked... and because this
                      website didn't yet have a konami code easter egg..... just
                      remember: ↑ ↑ ↓ ↓ ← → ← → B A, index page only.
                    </li>
                  </ul>
                </li>
                <li>
                  [10/16/20]
                  <p>It's time for... more editor shenanigans!</p>
                  <ul>
                    <li>
                      New format types: <strong>inline code</strong>,{" "}
                      <strong>code block</strong> and{" "}
                      <strong>block quote</strong>! Also, there's a new size of
                      heading (H3) for even more fine-grained control, and
                      bolding one works correctly again.
                    </li>
                    <li>
                      Images now retain their extension upon upload. There's
                      even an actual loading indicator as they're being added to
                      the editor.
                    </li>
                    <li>
                      Fixed bugs with adding links to comments. Add away, and
                      let me know if problems persist!
                    </li>
                    <li>
                      <strong>Random Fixes:</strong> tags CSS has hopefully been
                      FINALLY conquered, timeline view should display updated
                      comment threads automatically, Boos are now moving around
                      even on older iOS versions, and the board highlight should
                      resize correctly as you move across them.
                    </li>
                  </ul>
                </li>
                <li>
                  [10/14/20] <p>Happy Spoopy Season!</p>
                </li>
                <li>
                  [10/12/20]
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
                </li>
                <li>
                  [10/09/20]
                  <p>
                    Small improvements all around:
                    <ul>
                      <li>
                        You can now mark tweets (and only tweets) as spoilers.
                        That kinda came for free with next update, which is....
                      </li>
                      <li>
                        You can now select whether you want the full tweet
                        thread or the single tweet when embedding one.
                      </li>
                      <li>
                        Last, if a board has specific categories, these will
                        appear as suggestions when adding one to your thread.
                      </li>
                      <li>
                        [Bug Fixes] fixed problem where board wouldn't get
                        updated until refresh when hiding/muting threads; fixed
                        problems with last bulletpoint of list losing
                        formatting.
                      </li>
                      <li>
                        [Restyling] the editor formatting options should now
                        look nicer on really tiny screens; please behold our
                        new, beautiful tag input & display.
                      </li>
                      <li>
                        ...and last (but not least), I've finally figured out
                        how to make ALL traffic be HTTPS on AppEngine! If you
                        were going to BB only through HTTP, you might have to
                        log in again!
                      </li>
                    </ul>
                  </p>
                </li>
                <li>
                  [10/07/20]
                  <p>
                    Might add more updates later today, but for now:
                    <ul>
                      <li>
                        Added default view mode selection. Want to make a
                        Gallery? A timeline? You can now choose! Of course, the
                        other modes aren't as battle-tested as thread. Try them
                        out, and leave feedback (in the login menu)!
                      </li>
                      <li>
                        Category filtering now works on boards. It's not
                        automatic, as the board tags need to be added by the
                        editor. You'll soon see an example in !bobaland.
                      </li>
                      <li>
                        Bunch of CSS fixes, including the tags indentation
                        and... the iOS sidemenu flicker.... again.....
                        hopefully.......
                      </li>
                    </ul>
                    (And if you're wondering, "can I change the default view of
                    older threads/add tags?", the answer is: soon, I swear.)
                  </p>
                </li>
                <li>
                  [10/04/20]
                  <p>
                    Most of you won't be directly influenced by these updates,
                    but we've just unlocked our first batch of admin tools, and
                    introduced the concept of Roles.
                  </p>
                  <p>
                    What are Roles? Well, like on Discord, Roles can be assigned
                    to users, and each of them can have a bunch of associated
                    permissions. This means that, instead of dividing people in
                    "moderators/admins" and "everyone else", we can create as
                    many fine-grained roles as we want, filling many different
                    purposes.
                  </p>
                  <p>
                    Right now there's only two permissions: edit sidebar (yes,
                    we're finally going to get sidebar descriptions), and "post
                    as role". What does post as role do? Head to !bobaland to
                    find out.
                  </p>
                </li>
                <li>
                  [9/30/20]
                  <p>
                    It's time for two highly-requested features to make their
                    debut:
                    <ul>
                      <li>You can now mute boards.</li>
                      <li>
                        You can now dismiss notifications for a single board.
                      </li>
                    </ul>
                    What else there is to say? You're welcome. <br />
                    <em>
                      (Oh, right! The login menu has an anonymous feedback form
                      now. Use it often and liberally!)
                    </em>
                  </p>
                </li>
                <li>
                  [9/25/20]
                  <p>
                    A bigger update shall come in the following days (once the
                    first contracted job comes in 🤞), but in the meantime enjoy
                    a bunch of well-deserved bug fixes:
                    <ul>
                      <li>
                        <strong>Added more formatting options for text</strong>.
                        Just go see. (Also links are pink now).
                      </li>
                      <li>
                        More things can be clicked open in another tab:
                        everything in the top header bar, thread links, pages in
                        the login menu... Let me know if I forgot something!
                      </li>
                      <li>
                        Tags should now go to the next line.... better. No more
                        splitting in the middle of the word unless necessary.
                      </li>
                      <li>
                        The flickering sidemenu on the new version of iOS has
                        been fixed. The evil has temporarily been defeated once
                        again.
                      </li>
                    </ul>
                  </p>
                </li>
                <li>
                  [9/11/20]
                  <p>
                    Still technically on hiatus and working on the volunteers
                    onboarding, but I couldn't see you all suffer like this.
                  </p>
                  <p>
                    Fixed the * button (I hope), testing a new method to get
                    around Big Orange, and adding some fixes I had made for the
                    TTTE gallery preview back into the main website.
                  </p>
                </li>
                <li>
                  [9/4/20]
                  <p>Invites time!</p>
                  <p>
                    We now have an invite flows, and people can sign up simply
                    by using a link tied up to their email address! (Gasp! The
                    future is here!)
                  </p>
                  <p>
                    For things more relevant to you all... Click on the top
                    right menu and behold the user settings page. You can change
                    your username, avatar and... I'm not going to say more. Just
                    check it out.
                  </p>
                </li>
                <li>
                  [8/30/20]
                  <p>Weather forecast: buggy.</p>
                  <p>
                    Today's update is huge. I've completely reworked the logic
                    for displaying threads so it's not a crime against
                    programming (as much), and added two view modes:{" "}
                    <b>gallery</b> and <b>timeline</b>. In gallery mode, you can
                    also use post categories to filter what you see.
                  </p>
                  <p>
                    These modes are currently only available on larger screens
                    (mobile is pending on me figuring out where to put the
                    buttons). If all goes well, you'll soon be able to choose
                    the default view mode when creating a new thread.
                  </p>
                  <p>
                    While this doesn't defeat the Arcana thread yet, it's a step
                    forward. Feedback & thoughts welcome (so hit that report
                    button) (there's no report button) (use the usual avenues).
                  </p>
                </li>
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
      />
    </div>
  );
}

export default HomePage;
