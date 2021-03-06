import React from "react";
import { FeedWithMenu } from "@bobaboard/ui-components";
import Layout from "../../components/Layout";
import { useInfiniteQuery } from "react-query";
import { useAuth } from "../../components/Auth";
import { getUserActivityData } from "../../utils/queries/user";
import debug from "debug";
import { ThreadType } from "../../types/Types";
import FeedSidebar from "../../components/feed/FeedSidebar";

import LoadingSpinner from "components/LoadingSpinner";
import ThreadPreview from "components/ThreadPreview";
import { withEditors } from "components/editors/withEditors";
import { useBoardsContext } from "components/BoardContext";
import { isFromBackButton } from "components/hooks/useFromBackButton";
import { ExistanceParam } from "components/QueryParamNextProvider";
import { useQueryParams } from "use-query-params";
import { useCachedLinks } from "components/hooks/useCachedLinks";

const info = debug("bobafrontend:boardPage-info");
info.log = console.info.bind(console);

const FeedParams = {
  showRead: ExistanceParam,
  ownOnly: ExistanceParam,
};

function UserFeedPage() {
  const [isShowingSidebar, setShowSidebar] = React.useState(false);
  const [{ showRead, ownOnly }, setQuery] = useQueryParams(FeedParams);
  const { isLoggedIn, isPending: isAuthPending } = useAuth();
  const { boardsData } = useBoardsContext();
  const { linkToHome } = useCachedLinks();

  React.useEffect(() => {
    if (!isAuthPending && !isLoggedIn) {
      linkToHome.onClick?.();
    }
  }, [isAuthPending, isLoggedIn, linkToHome]);

  const feedOptions = React.useMemo(
    () => ({
      ownOnly,
      updatedOnly: !showRead,
    }),
    [showRead, ownOnly]
  );

  const onOptionsChange = React.useCallback((options) => {
    setQuery(
      {
        ownOnly: options.ownOnly,
        showRead: !options.updatedOnly,
      },
      "replace"
    );
  }, []);

  const {
    data: userActivityData,
    isFetching: isFetchingUserActivity,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ["userActivityData", feedOptions],
    ({ pageParam = undefined }) => getUserActivityData(feedOptions, pageParam),
    {
      getNextPageParam: (lastGroup) => {
        return lastGroup?.nextPageCursor;
      },
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      enabled: !isFromBackButton(),
    }
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
                        <div
                          className="post"
                          key={`${thread.threadId}_container`}
                        >
                          <ThreadPreview
                            thread={thread}
                            isLoggedIn={isLoggedIn}
                            originBoard={boardsData[thread.boardSlug]}
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
