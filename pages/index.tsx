import {
  BoardsDisplay,
  PostQuote,
  RulesBlock,
  useBoos,
} from "@bobaboard/ui-components";
import {
  PostType,
  RealmType,
  RulesBlock as RulesBlockType,
  SubscriptionBlock,
  UiBlocks,
} from "types/Types";
import {
  REALM_QUERY_KEY,
  useRealmBoards,
  useRealmContext,
  useRealmHomepage,
} from "contexts/RealmContext";
import React, { useState } from "react";
import { getCurrentRealmSlug, isStaging } from "utils/location-utils";
import {
  prefetchSubscriptionData,
  useSubscription,
} from "queries/subscriptions";

import Layout from "components/layout/Layout";
import Link from "next/link";
import { NextPage } from "next";
import { PageContextWithQueryClient } from "additional";
import { THREAD_PATH } from "utils/router-utils";
import ca from "date-fns/esm/locale/ca/index.js";
import debug from "debug";
import { formatDistanceToNow } from "date-fns";
import { getLatestSubscriptionUpdate } from "utils/queries/subscription";
import { makeClientPost } from "utils/client-data";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useNotifications } from "queries/notifications";

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

const UpdatesDisplay = ({ subscriptionId, title }: SubscriptionBlock) => {
  const data = useSubscription({ subscriptionId });

  if (!data) {
    return <div>Loading</div>;
  }

  const subscriptionPost = data.activity[0];
  const updatesThreadUrl = `${process.env.NEXT_PUBLIC_RELEASE_THREAD_URL}/${subscriptionPost?.postId}`;
  return (
    <div className="updates">
      <h2>{title}</h2>
      {data && (
        <div className="last">
          [Last Updated:{" "}
          {new Date(subscriptionPost.created).toLocaleDateString()}.{" "}
          <Link
            href={THREAD_PATH}
            as={
              isStaging()
                ? process.env.NEXT_PUBLIC_RELEASE_THREAD_URL_STAGING
                : process.env.NEXT_PUBLIC_RELEASE_THREAD_URL || ""
            }
          >
            <a>Older logs.</a>
          </Link>
          ]
          <PostQuote
            createdTime={formatDistanceToNow(
              new Date(subscriptionPost.created),
              { addSuffix: true }
            )}
            createdTimeLink={{
              href: updatesThreadUrl,
            }}
            text={subscriptionPost.content}
            secretIdentity={subscriptionPost.secretIdentity}
          />
        </div>
      )}
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

const RulesBlockWithShowAll = (rulesBlock: RulesBlockType) => {
  const [showAllRules, setShowAllRules] = useState(false);
  return (
    <div className="rules-block">
      <RulesBlock
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
    </div>
  );
};

const UiBlock = (props: UiBlocks) => {
  switch (props.type) {
    case "rules":
      return <RulesBlockWithShowAll {...props} />;
    case "subscription":
      return <UpdatesDisplay {...props} />;
  }
};

const HomePage: NextPage = () => {
  const { styles } = useBoos({ startActive: true });
  const { getLinkToBoard } = useCachedLinks();
  const boards = useRealmBoards();
  const realmHomepage = useRealmHomepage();
  const { id: realmId } = useRealmContext();
  const { realmBoardsNotifications } = useNotifications({ realmId });

  const boardsToDisplay = React.useMemo(() => {
    return boards
      .filter((board) => !board.delisted)
      .map((board) => ({
        slug: board.slug.replace("_", " "),
        avatar: board.avatarUrl,
        description: board.tagline,
        color: board.accentColor,
        updates: !!realmBoardsNotifications[board.id]?.hasUpdates,
        muted: board.muted,
        link: getLinkToBoard(board.slug),
      }));
  }, [boards, realmBoardsNotifications, getLinkToBoard]);

  return (
    <div className="main">
      <Layout title={`Hello!`}>
        <Layout.MainContent>
          <div className="content">
            <div className="intro">
              <div className="title">
                <h1>Welcome to B🌸baB🌸ard!</h1>
              </div>
              <div className="tagline">
                "Where the bugs are funny and the people are cool" — Outdated
                Meme
              </div>
              {isStaging() && <StagingWarning />}
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
              <BoardsDisplay boards={boardsToDisplay} />
            </div>
            {styles}
          </div>
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
          text-align: center;
          margin: 0 auto;
          padding: 20px;
          width: 100%;
          box-sizing: border-box;
          --board-display-min-size: 180px;
        }
        .display {
          max-width: 749px;
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
        .filter((b): b is SubscriptionBlock => b.type == "subscription")
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
