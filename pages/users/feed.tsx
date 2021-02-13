import React from "react";
import { FeedWithMenu } from "@bobaboard/ui-components";
import Layout from "../../components/Layout";
import { useInfiniteQuery } from "react-query";
import { useAuth } from "../../components/Auth";
import { getUserActivityData } from "../../utils/queries/user";
import debug from "debug";
import { ThreadType } from "../../types/Types";
import FeedSidebar, { FeedOptions } from "../../components/feed/FeedSidebar";

import { createLinkTo } from "utils/link-utils";
import LoadingSpinner from "components/LoadingSpinner";
import ThreadPreview from "components/ThreadPreview";
import { withEditors } from "components/editors/withEditors";
import { useBoardContext } from "components/BoardContext";
import { isFromBackButton } from "components/hooks/useFromBackButton";

const info = debug("bobafrontend:boardPage-info");
info.log = console.info.bind(console);

function UserFeedPage() {
  const [isShowingSidebar, setShowSidebar] = React.useState(false);
  const [feedOptions, setFeedOptions] = React.useState<FeedOptions>({
    updatedOnly: true,
    ownOnly: false,
  });
  const { isLoggedIn } = useAuth();
  const { boardsData } = useBoardContext();

  console.log(isFromBackButton());
  const {
    data: userActivityData,
    isFetching: isFetchingUserActivity,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ["userActivityData", { ...feedOptions }],
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
    !isFetchingUserActivity && userActivityData?.[0]?.activity?.length === 0;

  return (
    <div className="main">
      <Layout
        title={`Your Stuff`}
        onTitleClick={createLinkTo({ url: "/users/feed" })?.onClick}
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
                onOptionsChange={setFeedOptions}
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
                {!showEmptyMessage && (
                  <div className="spinner">
                    <LoadingSpinner
                      loading={isFetchingNextPage || isFetchingUserActivity}
                      idleMessage={
                        hasNextPage ? "..." : "Nothing more to load."
                      }
                      loadingMessage={"Loading more"}
                    />
                  </div>
                )}
              </div>
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
        .spinner {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}

export default withEditors(UserFeedPage);
