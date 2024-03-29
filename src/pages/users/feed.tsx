import { FeedOptions, useUserFeed } from "lib/api/hooks/user-feed";

import { ExistanceParam } from "components/QueryParamNextProvider";
import FeedBottomBar from "components/feed/FeedBottomBar";
import FeedSidebar from "components/feed/FeedSidebar";
import { FeedWithMenu } from "@bobaboard/ui-components";
import Layout from "components/core/layouts/Layout";
import LoadingSpinner from "components/LoadingSpinner";
import React from "react";
import ThreadPreview from "components/core/feeds/ThreadPreview";
import debug from "debug";
import { isFromBackButton } from "components/core/useFromBackButton";
import { useAuth } from "components/Auth";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useQueryParams } from "use-query-params";
import { useRealmBoards } from "contexts/RealmContext";
import { withEditors } from "components/core/editors/withEditors";

const info = debug("bobafrontend:boardPage-info");
info.log = console.info.bind(console);

export const FeedParams = {
  showRead: ExistanceParam,
  ownOnly: ExistanceParam,
};

function UserFeedPage() {
  const [isShowingSidebar, setShowSidebar] = React.useState(false);
  const [feedOptions, setQuery] = useQueryParams(FeedParams);
  const { isLoggedIn, isPending: isAuthPending } = useAuth();

  const realmBoards = useRealmBoards();
  const { linkToHome } = useCachedLinks();
  const showSidebar = React.useCallback(() => setShowSidebar(true), []);

  const {
    data: userActivityData,
    isFetching: isFetchingUserActivity,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useUserFeed({
    enabled: !isFromBackButton(),
    feedOptions,
  });

  React.useEffect(() => {
    if (!isAuthPending && !isLoggedIn) {
      linkToHome.onClick?.();
    }
  }, [isAuthPending, isLoggedIn, linkToHome]);

  const onOptionsChange = React.useCallback(
    (options: FeedOptions) => {
      setQuery(options, "replace");
    },
    [setQuery]
  );

  const fetchNext = React.useCallback(() => {
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
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);
  const hideSidebar = React.useCallback(() => setShowSidebar(false), []);

  const showEmptyMessage =
    !isFetchingUserActivity &&
    userActivityData?.pages?.[0]?.activity?.length === 0;

  return (
    <div className="main">
      <Layout
        title={`Your Stuff`}
        forceHideTitle={true}
        loading={isFetchingUserActivity}
      >
        <Layout.MainContent>
          <FeedWithMenu
            onCloseSidebar={hideSidebar}
            showSidebar={isShowingSidebar}
            onReachEnd={fetchNext}
          >
            <FeedWithMenu.Sidebar>
              <FeedSidebar
                currentOptions={feedOptions}
                onOptionsChange={onOptionsChange}
                open={isShowingSidebar}
              />
            </FeedWithMenu.Sidebar>
            <FeedWithMenu.FeedContent>
              <div className="main">
                {showEmptyMessage && (
                  <img className="empty" src={"/nothing.jpg"} />
                )}
                {userActivityData?.pages &&
                  userActivityData.pages
                    .flatMap((activityData) => activityData?.activity)
                    .map((thread) => {
                      return (
                        <div
                          className="thread"
                          key={`${thread.id}_container`}
                          data-thread-id={thread.id}
                        >
                          <ThreadPreview
                            thread={thread}
                            isLoggedIn={isLoggedIn}
                            originBoard={realmBoards.find(
                              (board) => board.slug == thread.parentBoardSlug
                            )}
                          />
                        </div>
                      );
                    })}
              </div>
              {!showEmptyMessage && (
                <LoadingSpinner
                  loading={isFetchingNextPage || isFetchingUserActivity}
                  idleMessage={hasNextPage ? "..." : "Nothing more to load."}
                  loadingMessage={"Loading more"}
                />
              )}
            </FeedWithMenu.FeedContent>
          </FeedWithMenu>
        </Layout.MainContent>
        <Layout.BottomBar>
          <FeedBottomBar onCompassClick={showSidebar} />
        </Layout.BottomBar>
      </Layout>
      <style jsx>{`
        .main {
          width: 100%;
        }
        .thread {
          margin: 20px auto;
          margin-bottom: 30px;
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
        .loading {
          text-align: center;
          margin-bottom: 20px;
          color: white;
        }
        .under-construction {
          width: 50px;
          margin: 0 auto;
          display: block;
          opacity: 0.5;
          filter: grayscale(0.4);
        }
      `}</style>
    </div>
  );
}

export default withEditors(UserFeedPage);
