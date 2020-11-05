import React from "react";
import Layout from "../components/Layout";
import { useKonamiCode } from "components/hooks/useKonamiCode";
import { BoardsDisplay } from "@bobaboard/ui-components";
import Link from "next/link";
import debug from "debug";
import { BOARD_URL_PATTERN, createLinkTo } from "utils/link-utils";

const info = debug("bobafrontend:index-info");

import css from "styled-jsx/css";
import { useBoardContext } from "components/BoardContext";

const GHOST_SIZE = 50;
const BOUNDARY = 69;
const { className, styles } = css.resolve`
  div {
    position: absolute;
    z-index: 10;
    left: 0;
    top: 0;
    opacity: 0;
    background-image: url("/boo_awake.png");
    width: ${GHOST_SIZE}px;
    height: ${GHOST_SIZE}px;
    background-size: contain;
    background-repeat: no-repeat;
    transform-origin: top left;
  }
  div:hover {
    cursor: pointer;
  }
  .left {
    background-image: url("/boo_awake_flipped.png");
  }
  .right {
  }
  .popout {
    animation: popout 0.4s ease;
    animation-name: popout;
    animation-duration: 0.4s;
    animation-timing-function: ease;
    transform-origin: 50% 50%;
    background-image: url("/boo_shy.png");
  }
  .popout.left {
    background-image: url("/boo_shy_flipped.png");
  }
  @keyframes popout {
    from {
      opacity: 1;
      transform: scale(0.8);
    }
    to {
      opacity: 0;
      transform: scale(1.2);
    }
  }
  @-webkit-keyframes popout {
    0% {
      opacity: 1;
      transform: scale(0.8);
    }
    100% {
      opacity: 0;
      transform: scale(1.2);
    }
  }
`;

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}
let MAX_GHOSTS = 0;
let GHOST_CHANCE = 3;
let GHOST_INTERVAL = 1000;
let currentGhosts = 0;
const newGhost = (callback: () => void) => {
  info("Hello");
  const newGhost = document.createElement("div");
  newGhost.classList.add(className);
  document.body.appendChild(newGhost);
  newGhost.style.transform = `translate(${getRandomInt(
    innerWidth - GHOST_SIZE
  )}px, ${pageYOffset + getRandomInt(innerHeight - GHOST_SIZE)}px)`;
  newGhost.dataset.lifespan = "" + (4 + getRandomInt(4));
  info(`New ghost at ${newGhost.style.transform}`);

  const moveGhost = (ghost: HTMLDivElement) => {
    if (ghost.classList.contains("popout")) {
      return;
    }
    if (!ghost.parentNode) {
      return;
    }
    if (ghost.style.opacity === "0" && ghost.parentNode) {
      ghost.parentNode?.removeChild(ghost);
      // info(`removing ghost ${ghost.dataset.index}`);
      // info(currentGhosts);
      callback();
      return;
    }
    if (
      parseInt(ghost.dataset.moves || "0") >
      parseInt(newGhost.dataset.lifespan || "0")
    ) {
      ghost.style.opacity = "0";
    }
    const deltaX = getRandomInt(2) % 2 ? 100 : -100;
    const deltaY = getRandomInt(2) % 2 ? 100 : -100;
    let currentX = ghost.getBoundingClientRect().left;
    let currentY =
      ghost.getBoundingClientRect().top -
      (ghost.offsetParent?.getBoundingClientRect().top || 0);
    let nextX = currentX + deltaX;
    let nextY = currentY + deltaY;
    if (nextX < 0 || nextX + GHOST_SIZE > innerWidth) {
      nextX = currentX - deltaX;
    }
    if (
      nextY < BOUNDARY ||
      nextY + GHOST_SIZE > pageYOffset + innerHeight - BOUNDARY
    ) {
      nextY = currentY - deltaY;
    }
    ghost.classList.toggle("left", nextX < currentX);
    ghost.classList.toggle("right", nextX > currentX);
    // info(`${currentX} ${currentY}`);
    // info(`${deltaX} ${deltaY}`);
    // info(`translate(${nextX}px, ${nextY}px)`);
    ghost.style.transform = `translate(${nextX}px, ${nextY}px)`;
    ghost.dataset.moves = "" + (parseInt(ghost.dataset.moves || "0") + 1);
  };
  newGhost.addEventListener("transitionend", () => {
    // let currentX = newGhost.getBoundingClientRect().x;
    // let currentY = newGhost.getBoundingClientRect().y;
    // // info(`${currentX} ${currentY}`);
    moveGhost(newGhost);
  });
  newGhost.addEventListener("click", (e) => {
    let currentX = newGhost.getBoundingClientRect().left;
    let currentY =
      newGhost.getBoundingClientRect().top -
      (newGhost.offsetParent?.getBoundingClientRect().top || 0);
    requestAnimationFrame(() => {
      newGhost.classList.toggle("popout");
    });
    // Remove all styles tied up to transition since the animation
    // will override them. Given that we can't then use
    //
    // If you don't remove the timing of transition
    // safari will do the (for once) right thing and the element will just
    // slowly translate to its new (0, 0) position, which means its position
    // overall will be wrong.
    newGhost.style.top = `${currentY}px`;
    newGhost.style.left = `${currentX}px`;
    newGhost.style.transition = ``;
    newGhost.style.transform = `translate(0, 0)`;
    setTimeout(() => {
      newGhost.parentNode?.removeChild(newGhost);
      callback();
    }, 300);
    e.stopPropagation();
  });
  requestAnimationFrame(() => {
    // Add transform here after you have set the starting position so it
    // won't just gradually move there
    newGhost.style.transition = `transform 2.5s linear, opacity 2.5s linear`;
    newGhost.style.opacity = "1";
    newGhost.dataset.index = "" + currentGhosts;
    moveGhost(newGhost);
  });

  return newGhost;
};

function HomePage() {
  const { boardsData } = useBoardContext();
  useKonamiCode(() => {
    GHOST_CHANCE = 1;
    MAX_GHOSTS = 1000000000;
    GHOST_INTERVAL = 500;
  });

  const ghosts = React.useRef<any[]>([]);
  const timeout = React.useRef<any>(null);
  React.useEffect(() => {
    currentGhosts = 0;
    const maybeCreateGhost = () => {
      // info(currentGhosts);
      if (
        currentGhosts < MAX_GHOSTS &&
        getRandomInt(GHOST_CHANCE) % GHOST_CHANCE == 0
      ) {
        currentGhosts = currentGhosts + 1;
        const spawned = newGhost(() => {
          // info(currentGhosts);
          ghosts.current = ghosts.current.filter((ghost) => ghost != spawned);
          currentGhosts = currentGhosts - 1;
        });
        ghosts.current.push(spawned);
      }
      timeout.current = setTimeout(() => {
        maybeCreateGhost();
      }, GHOST_INTERVAL);
    };
    timeout.current = setTimeout(() => {
      maybeCreateGhost();
    }, GHOST_INTERVAL);
    return () => {
      ghosts.current.forEach((ghost: HTMLDivElement) => {
        ghost.parentElement?.removeChild(ghost);
      });
      currentGhosts = 0;
      clearTimeout(timeout.current);
    };
  }, []);

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
                  [Last Updated: 11/04/20.{" "}
                  <Link href="/update-logs">
                    <a>Older logs.</a>
                  </Link>
                  ]
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
