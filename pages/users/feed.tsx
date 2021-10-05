import React from "react";
import { FeedWithMenu } from "@bobaboard/ui-components";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../components/Auth";
import debug from "debug";
import { ThreadType } from "../../types/Types";
import FeedSidebar from "../../components/feed/FeedSidebar";
import {
  FeedOptions,
  useUserFeed,
} from "../../components/hooks/queries/user-feed";

import LoadingSpinner from "components/LoadingSpinner";
import ThreadPreview from "components/ThreadPreview";
import { withEditors } from "components/editors/withEditors";
import { ExistanceParam } from "components/QueryParamNextProvider";
import { useQueryParams } from "use-query-params";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useRealmBoards } from "contexts/RealmContext";
import { isFromBackButton } from "components/hooks/useFromBackButton";

const info = debug("bobafrontend:boardPage-info");
info.log = console.info.bind(console);

const FeedParams = {
  showRead: ExistanceParam,
  ownOnly: ExistanceParam,
};

function UserFeedPage() {
  const [isShowingSidebar, setShowSidebar] = React.useState(false);
  const [feedOptions, setQuery] = useQueryParams(FeedParams);
  const { isLoggedIn, isPending: isAuthPending } = useAuth();

  const realmBoards = useRealmBoards();
  const { linkToHome } = useCachedLinks();

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
  const showSidebar = React.useCallback(() => setShowSidebar(true), []);

  const showEmptyMessage =
    !isFetchingUserActivity &&
    userActivityData?.pages?.[0]?.activity?.length === 0;

  return (
    <div className="main">
      <Layout
        title={`Your Stuff`}
        onCompassClick={showSidebar}
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
                    .map((thread: ThreadType) => {
                      return (
                        <div className="post" key={`${thread.id}_container`}>
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
      </Layout>
      <style jsx>{`
        .main {
          width: 100%;
        }
        .post {
          margin: 20px auto;
          margin-bottom: 30px;
          width: 100%;
        }
        .post > :global(div) {
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
