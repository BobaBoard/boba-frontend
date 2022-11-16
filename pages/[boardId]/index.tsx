import { ArrayParam, useQueryParams } from "use-query-params";
import { BoardPageDetails, usePageDetails } from "utils/router-utils";
import {
  REALM_QUERY_KEY,
  useBoardSummary,
  useCurrentRealmBoardId,
  useRealmPermissions,
} from "contexts/RealmContext";
import { RealmPermissions, RealmType, ThreadSummaryType } from "types/Types";
import {
  getCurrentHost,
  getCurrentRealmSlug,
  isClientContext,
} from "utils/location-utils";
import { prefetchBoardMetadata, useBoardMetadata } from "queries/board";

import BoardBottomBar from "components/boards/BoardBottomBar";
import { BoardSidebar } from "components/boards/Sidebar";
import { FeedWithMenu } from "@bobaboard/ui-components";
import Layout from "components/layout/Layout";
import LoadingSpinner from "components/LoadingSpinner";
import { NextPage } from "next";
import { PageContextWithQueryClient } from "additional";
import React from "react";
import ThreadPreview from "components/ThreadPreview";
import axios from "axios";
import debug from "debug";
import { useAuth } from "components/Auth";
import { useBoardActivity } from "queries/board-feed";

const log = debug("bobafrontend:BoardPage-log");
const info = debug("bobafrontend:BoardPage-info");
info.log = console.info.bind(console);

export const BoardParams = {
  filter: ArrayParam,
};

const MemoizedThreadPreview = React.memo(ThreadPreview);
function BoardPage() {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const closeSidebar = React.useCallback(() => setShowSidebar(false), []);
  const { slug } = usePageDetails<BoardPageDetails>();
  const { isPending: isAuthPending, isLoggedIn } = useAuth();
  const boardId = useCurrentRealmBoardId({ boardSlug: slug });
  const realmPermissions = useRealmPermissions();
  // TODO: make this easier:
  // We need to use the broad summary from the realm data to check if the board is locked
  // because if it is and we don't have access, the backend will send a 403 status instead of the board data
  // when we call useBoardMetadata, and boardMetadata.loggedInOnly will never be true.
  const locked = useBoardSummary({ boardId })?.loggedInOnly;
  const { boardMetadata, isFetched: isBoardMetadataFetched } = useBoardMetadata(
    { boardId }
  );
  const onCompassClick = React.useCallback(
    () => setShowSidebar(!showSidebar),
    [showSidebar]
  );
  const [{ filter: categoryFilter }, setQuery] = useQueryParams(BoardParams);

  React.useEffect(() => {
    setQuery({
      filter: undefined,
    });
  }, [slug, setQuery]);
  const onSetFilter = React.useCallback(
    (filter) => {
      setQuery({ filter: [filter] }, "replace");
    },
    [setQuery]
  );

  const {
    data: boardActivityData,
    isFetching: isFetchingBoardActivity,
    isFetched: boardActivityFetched,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useBoardActivity({
    boardId,
    categoryFilter,
  });

  React.useEffect(() => {
    if (!isAuthPending && isLoggedIn && boardActivityFetched && boardId) {
      log(`Marking board ${boardId} as visited`);
      axios.post(`boards/${boardId}/visits`);
    }
  }, [isAuthPending, isLoggedIn, boardId, boardActivityFetched]);

  const onCategoriesStateChange = React.useCallback(
    (categories: { name: string; active: boolean }[]) => {
      const activeCategories = categories.filter((category) => category.active);
      setQuery(
        {
          filter:
            activeCategories.length == 1
              ? [activeCategories[0].name]
              : undefined,
        },
        "replace"
      );
    },
    [setQuery]
  );

  const showLockedMessage =
    !isAuthPending &&
    !realmPermissions?.includes(
      RealmPermissions.ACCESS_LOCKED_BOARDS_ON_REALM
    ) &&
    locked;
  const showEmptyMessage =
    !showLockedMessage &&
    !isFetchingBoardActivity &&
    boardActivityData?.pages?.[0]?.activity?.length === 0;

  return (
    <div className="main">
      <Layout title={`!${slug}`} forceHideTitle={true}>
        <Layout.MainContent>
          <FeedWithMenu
            onCloseSidebar={closeSidebar}
            showSidebar={showSidebar}
            onReachEnd={React.useCallback(() => {
              info(`Attempting to fetch more...`);
              info(hasNextPage);
              if (hasNextPage && !isFetchingNextPage) {
                info(`...found stuff!`);
                fetchNextPage();
                return;
              }
              info(
                isFetchingNextPage
                  ? `...but we're already fetching`
                  : `...but there's nothing!`
              );
            }, [hasNextPage, isFetchingNextPage, fetchNextPage])}
          >
            <FeedWithMenu.Sidebar>
              <BoardSidebar
                loading={!isBoardMetadataFetched}
                boardMetadata={boardMetadata}
                pageSlug={slug}
                activeCategory={categoryFilter?.[0] || null}
                onCategoriesStateChange={onCategoriesStateChange}
              />
            </FeedWithMenu.Sidebar>
            <FeedWithMenu.FeedContent>
              <div className="main">
                {showLockedMessage && (
                  <div className="locked">
                    <img src={"/locked.png"} />
                    <p>This board is restricted to realm members.</p>
                  </div>
                )}
                {showEmptyMessage && (
                  <img className="empty" src={"/nothing.jpg"} />
                )}
                {!showLockedMessage &&
                  boardActivityData?.pages &&
                  boardActivityData.pages
                    .flatMap((activityData) => activityData?.activity)
                    .map((thread: ThreadSummaryType) => {
                      return (
                        <div
                          className="thread"
                          key={`${thread.id}_container`}
                          data-thread-id={thread.id}
                        >
                          <MemoizedThreadPreview
                            thread={thread}
                            isLoggedIn={isLoggedIn}
                            onSetCategoryFilter={onSetFilter}
                          />
                        </div>
                      );
                    })}
              </div>
              {!showLockedMessage && !showEmptyMessage && (
                <LoadingSpinner
                  loading={isFetchingNextPage || isFetchingBoardActivity}
                  idleMessage={hasNextPage ? "..." : "Nothing more to load."}
                  loadingMessage={
                    isFetchingBoardActivity ? "Loading" : "Loading more"
                  }
                />
              )}
            </FeedWithMenu.FeedContent>
          </FeedWithMenu>
        </Layout.MainContent>
        <Layout.BottomBar>
          <BoardBottomBar onCompassClick={onCompassClick} />
        </Layout.BottomBar>
      </Layout>
      <style jsx>{`
        .main {
          width: 100%;
          box-sizing: border-box;
        }
        .thread {
          margin: 20px auto;
          width: 100%;
        }
        .thread > :global(article) {
          margin: 0 auto;
        }
        .empty {
          margin: 0 auto;
          display: block;
          margin-top: 30px;
          filter: grayscale(0.4);
          max-width: 100%;
        }
        .locked {
          max-width: 800px;
          margin: 0 auto;
          margin-top: 30px;
        }
        .locked img {
          display: block;
          filter: grayscale(0.4);
          max-width: 100%;
          margin: 0 auto;
        }
        .locked p {
          color: white;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

const MemoizedBoardPage: NextPage = React.memo(BoardPage);
export default MemoizedBoardPage;

MemoizedBoardPage.getInitialProps = async (ctx: PageContextWithQueryClient) => {
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
    const boardId = realmData?.boards.find(
      // TODO: rename boardId to boardSlug
      (board) => `!${board.slug}` === ctx.query.boardId
    )?.id;
    if (!boardId) {
      // We should use 302 redirect here rather than 301 because
      // 301 will be cached by the client and trap us forever until
      // the cache is cleared.
      ctx.res?.writeHead(302, {
        location: `http://${getCurrentHost(ctx?.req?.headers?.host, true)}/404`,
      });
      ctx.res?.end();
      return {};
    }
    await prefetchBoardMetadata(ctx.queryClient, { boardId });
    return {};
  } catch (e) {
    return {};
  }
};
