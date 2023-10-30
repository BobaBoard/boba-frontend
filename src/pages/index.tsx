import {
  BoardListBlock,
  RulesBlock,
  SubscriptionBlock,
  useBoos,
} from "@bobaboard/ui-components";
import {
  BoardOptions,
  useBoardOptions,
} from "../components/hooks/useBoardOptions";
import {
  REALM_QUERY_KEY,
  useRealmBoards,
  useRealmContext,
  useRealmHomepage,
} from "contexts/RealmContext";
import React, { useState } from "react";
import {
  RealmType,
  RulesBlock as RulesBlockType,
  SubscriptionBlock as SubscriptionBlockType,
  UiBlocks,
} from "types/Types";
import {
  getCurrentRealmSlug,
  isClientContext,
  isLocalhost,
  isStaging,
} from "lib/location";
import {
  prefetchSubscriptionData,
  useSubscription,
} from "lib/api/hooks/subscriptions";
import { useMuteBoard, usePinBoard } from "lib/api/hooks/board";

import { GetProps } from "lib/typescript";
import Layout from "components/core/layouts/Layout";
import { NextPage } from "next";
import { PageContextWithQueryClient } from "additional";
import debug from "debug";
import { faTableCellsLarge } from "@fortawesome/free-solid-svg-icons";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useNotifications } from "lib/api/hooks/notifications";

const error = debug("bobafrontend:HomePage-error");

const StagingWarning = () => {
  return (
    <div className="staging-warning">
      <h2>ATTENTION</h2>
      <p>
        You're using the <strong>staging</strong> version of BobaBoard. Unless
        you're here for a reason, you likely want to be on{" "}
        <a href="http://v0.boba.social">v0.boba.social</a> insted.
      </p>
      <style jsx>{`
        .staging-warning {
          background-color: orangered;
          padding: 5px 15px;
          border-radius: 25px;
        }
        .staging-warning a {
          color: blue;
        }
      `}</style>
    </div>
  );
};

const LocalhostWarning = () => {
  return (
    <div className="staging-warning">
      <h2>Warning</h2>
      <p>
        The <code>locahost:3000</code> version of BobaBoard (which you're using)
        can only access the "twisted minds" Realm. Start the frontend with{" "}
        <code>yarn run dev:bonjour</code>, then use the following links to
        access the{" "}
        <a href="http://twisted-minds_boba.local:3000/">twisted minds realm</a>{" "}
        or <a href="http://uwu_boba.local:3000/">the uwu realm</a>.
      </p>
      <style jsx>{`
        .staging-warning {
          border: 3px dotted darkgoldenrod;
          padding: 5px 15px;
          border-radius: 25px;
          text-align: center;
          background-color: #1c1c1c;
        }
        .staging-warning a {
          color: darkgoldenrod;
        }
        code {
          color: darkcyan;
        }
      `}</style>
    </div>
  );
};

const SubscriptionBlockWithData = ({
  subscriptionId,
  title,
}: SubscriptionBlockType) => {
  const data = useSubscription({ subscriptionId });
  const { slug: realmSlug } = useRealmContext();

  if (!data) {
    return <div>Loading</div>;
  }

  const subscriptionPost = data.activity[0];
  // TODO: this is a terrible hack because we have no information on the thread itself within
  // the subscription.
  const boardName = realmSlug == "v0" ? "bobaland" : "fandconders";
  const updatesThreadUrl = `https://${realmSlug}.boba.social/!${boardName}/thread/${subscriptionPost.threadId}`;
  const lastestReleaseUrl = `${updatesThreadUrl}/${subscriptionPost.postId}`;
  return (
    <SubscriptionBlock
      title={title}
      showOlderLink={{
        href: updatesThreadUrl,
      }}
      lastUpdatedTime={new Date(subscriptionPost.created).toLocaleDateString()}
      lastUpdatedTimeLink={{
        href: lastestReleaseUrl,
      }}
      post={subscriptionPost.content}
      secretIdentity={subscriptionPost.secretIdentity}
      maxHeightPx={320}
    />
  );
};

const RulesBlockWithShowAll = (rulesBlock: RulesBlockType) => {
  const [showAllRules, setShowAllRules] = useState(false);
  return (
    <RulesBlock
      headerLinkLabel={showAllRules ? "Hide" : "See All"}
      seeAllLink={{
        onClick: () => setShowAllRules(!showAllRules),
      }}
      title={rulesBlock.title}
      rules={
        showAllRules
          ? rulesBlock.rules
          : rulesBlock.rules.filter((rule) => rule.pinned)
      }
    />
  );
};

const BoardListItemWithOptions = (
  props: Omit<GetProps<typeof BoardListBlock.Item>, "options"> & {
    id: string;
    as: React.FC<GetProps<typeof BoardListBlock.Item>>;
  }
) => {
  const boardOptions = useBoardOptions({
    options: [
      BoardOptions.COPY_LINK,
      BoardOptions.MUTE,
      BoardOptions.PIN,
      BoardOptions.DISMISS_NOTIFICATIONS,
    ],
    boardId: props.id || null,
  });

  return <BoardListBlock.Item {...props} options={boardOptions} />;
};

const UiBlock = (props: UiBlocks) => {
  switch (props.type) {
    case "rules":
      return <RulesBlockWithShowAll {...props} />;
    case "subscription":
      return <SubscriptionBlockWithData {...props} />;
  }
};

const HomePage: NextPage = () => {
  const { styles } = useBoos({ startActive: true });
  const { getLinkToBoard } = useCachedLinks();
  const boards = useRealmBoards();
  const realmHomepage = useRealmHomepage();
  const { id: realmId } = useRealmContext();
  const { realmBoardsNotifications } = useNotifications({ realmId });
  const [selectedBoard, setSelectedBoard] = React.useState<string | null>(null);
  const setBoardPinned = usePinBoard();
  const setBoardMuted = useMuteBoard();

  const boardsToDisplay = React.useMemo(() => {
    return boards
      .filter((board) => !board.delisted)
      .map((board) => ({
        id: board.id,
        slug: board.slug,
        avatar: board.avatarUrl,
        description: board.tagline,
        color: board.accentColor,
        updates: !!realmBoardsNotifications[board.id]?.hasUpdates,
        outdated: !!realmBoardsNotifications[board.id]?.isOutdated,
        muted: board.muted,
        link: getLinkToBoard(board.slug),
        pinned: board.pinned,
      }));
  }, [boards, realmBoardsNotifications, getLinkToBoard]);

  return (
    <div className="main">
      <Layout title={`Hello!`}>
        <Layout.MainContent>
          <div className="content">
            <div className="intro">
              <div className="title">
                <h1>Welcome to B🎃baB🎃ard!</h1>
              </div>
              <div className="tagline">
                "Where the bugs are funny and the people are cool" — Outdated
                Meme
              </div>
              {isStaging() && <StagingWarning />}
              {isLocalhost() && <LocalhostWarning />}
              <p>
                Remember: this is the experimental version of an experimental
                website. If you experience a problem, then stuff is likely to be{" "}
                <em>actually broken</em>.
              </p>
              <p>
                Please do report bugs, thoughts and praise (seriously, gotta
                know what's working) in the <code>#v0-report</code> discord
                channel, the <code>!bobaland</code> board or the (even more)
                anonymous feedback form in the user menu.
              </p>
              {realmHomepage.blocks.map((block) => (
                <UiBlock key={block.id} {...block} />
              ))}
            </div>
            <div className="display">
              <BoardListBlock
                icon={faTableCellsLarge}
                title={"Realm Boards"}
                selectedBoardSlug={selectedBoard}
                onSelectBoard={(slug) => {
                  setSelectedBoard(slug === selectedBoard ? null : slug);
                }}
                onPinBoard={function (slug: string): void {
                  const boardToPin = boards.find((board) => board.slug == slug);
                  if (!boardToPin) {
                    throw new Error(
                      `Attempted to pin non-existing board ${slug}`
                    );
                  }
                  setBoardPinned({
                    boardId: boardToPin.id,
                    pin: !boardToPin.pinned,
                  });
                }}
                onMuteBoard={function (slug: string): void {
                  const boardToMute = boards.find(
                    (board) => board.slug == slug
                  );
                  if (!boardToMute) {
                    throw new Error(
                      `Attempted to mute non-existing board ${slug}`
                    );
                  }
                  setBoardMuted({
                    boardId: boardToMute.id,
                    mute: !boardToMute.muted,
                  });
                }}
              >
                <BoardListBlock.Empty>
                  <div>No boards here</div>
                </BoardListBlock.Empty>
                {boardsToDisplay.map((board) => (
                  <BoardListItemWithOptions
                    key={board.id}
                    {...board}
                    as={BoardListBlock.Item}
                  />
                ))}
              </BoardListBlock>
            </div>
            {styles}
          </div>
          <footer>
            <a href="https://docs.bobaboard.com/docs/users/dmca-policy">
              DMCA policy
            </a>
          </footer>
        </Layout.MainContent>
      </Layout>
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
          margin: 0 auto;
          padding: 20px;
          width: 100%;
          box-sizing: border-box;
          --board-display-min-size: 180px;
        }
        .display {
          max-width: 1050px;
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
        .intro .christmas {
          height: 250px;
        }

        footer {
          border-top: 1px dotted #1c1c1c;
          color: white;
          text-align: center;
          font-size: small;
          padding-block: 8px;
        }

        @media only screen and (max-width: 700px) {
          .content {
            --board-display-min-size: 150px;
          }
        }
        @media only screen and (max-width: 400px) {
          h1 {
            font-size: 25px;
          }
          .content {
            --board-display-min-size: 120px;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;

HomePage.getInitialProps = async (ctx: PageContextWithQueryClient) => {
  if (isClientContext(ctx)) {
    // See _app.tsx on why this is necessary
    return {};
  }
  try {
    const realmSlug = getCurrentRealmSlug({
      serverHostname: ctx.req?.headers.host,
    });
    const realmData = await ctx.queryClient.getQueryData<RealmType>([
      REALM_QUERY_KEY,
      { realmSlug, isLoggedIn: false },
    ]);

    // Preload all subscriptions
    await Promise.all(
      realmData?.homepage.blocks
        .filter((b): b is SubscriptionBlockType => b.type == "subscription")
        .map(
          async (s) =>
            await prefetchSubscriptionData(ctx.queryClient, {
              subscriptionId: s.subscriptionId,
            })
        ) || []
    );

    return {};
  } catch (e) {
    error(`Error retrieving lastUpdate.`);
    return {
      lastUpdate: null,
    };
  }
};
