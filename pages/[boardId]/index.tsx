import React from "react";
import {
  FeedWithMenu,
  BoardSidebar,
  PostingActionButton,
} from "@bobaboard/ui-components";
import Layout from "../../components/Layout";
import { useAuth } from "../../components/Auth";
import {
  useBoardMetadata,
  useUpdateBoardMetadata,
} from "../../components/hooks/queries/board";
import axios from "axios";
import debug from "debug";
import { ThreadType } from "../../types/Types";
import { BoardPageDetails, usePageDetails } from "utils/router-utils";
import LoadingSpinner from "components/LoadingSpinner";
import ThreadPreview from "components/ThreadPreview";
import {
  EditorActions,
  useEditorsDispatch,
} from "components/editors/EditorsContext";
import { withEditors } from "components/editors/withEditors";
import {
  useBoardOptions,
  BoardOptions,
} from "components/hooks/useBoardOptions";
import { useBoardActivity } from "components/hooks/queries/board-activity";
import { ArrayParam, useQueryParams } from "use-query-params";

const log = debug("bobafrontend:BoardPage-log");
const info = debug("bobafrontend:BoardPage-info");
info.log = console.info.bind(console);

const NewThreadButton = withEditors<{ slug: string }>((props) => {
  const { boardMetadata } = useBoardMetadata({ boardId: props.slug });
  const editorDispatch = useEditorsDispatch();
  return (
    <MemoizedActionButton
      accentColor={boardMetadata?.accentColor || "#f96680"}
      onNewPost={React.useCallback(() => {
        editorDispatch({
          type: EditorActions.NEW_THREAD,
          payload: { boardSlug: props.slug },
        });
      }, [editorDispatch, props.slug])}
    />
  );
});

const BoardParams = {
  filter: ArrayParam,
};

const MemoizedThreadPreview = React.memo(ThreadPreview);
const MemoizedActionButton = React.memo(PostingActionButton);
const MemoizedBoardSidebar = React.memo(BoardSidebar);
function BoardPage() {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const closeSidebar = React.useCallback(() => setShowSidebar(false), []);
  const { slug } = usePageDetails<BoardPageDetails>();
  const { isPending: isAuthPending, isLoggedIn } = useAuth();
  const { boardMetadata, isFetched: isBoardMetadataFetched } = useBoardMetadata(
    { boardId: slug }
  );
  const onCompassClick = React.useCallback(
    () => setShowSidebar(!showSidebar),
    [showSidebar]
  );
  const [editingSidebar, setEditingSidebar] = React.useState(false);
  const stopEditing = React.useCallback(() => setEditingSidebar(false), []);
  const [{ filter: categoryFilter }, setQuery] = useQueryParams(BoardParams);
  const boardOptions = useBoardOptions({
    options: [
      BoardOptions.MUTE,
      BoardOptions.PIN,
      BoardOptions.DISMISS_NOTIFICATIONS,
      BoardOptions.EDIT,
    ],
    slug,
    callbacks: {
      editSidebar: setEditingSidebar,
    },
  });
  const updateBoardMetadata = useUpdateBoardMetadata({
    onSuccess: () => {
      setEditingSidebar(false);
    },
  });

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
    slug,
    categoryFilter,
  });

  React.useEffect(() => {
    if (!isAuthPending && isLoggedIn && boardActivityFetched) {
      log(`Marking board ${slug} as visited`);
      axios.post(`boards/${slug}/visits`);
    }
  }, [isAuthPending, isLoggedIn, slug, boardActivityFetched]);

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
    !isAuthPending && !isLoggedIn && boardMetadata?.loggedInOnly;
  const showEmptyMessage =
    !showLockedMessage &&
    !isFetchingBoardActivity &&
    boardActivityData?.pages?.[0]?.activity?.length === 0;

  return (
    <div className="main">
      <Layout
        title={`!${slug}`}
        onCompassClick={onCompassClick}
        forceHideTitle={true}
      >
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
              <div style={{ position: "relative" }}>
                <MemoizedBoardSidebar
                  slug={boardMetadata?.slug || slug}
                  avatarUrl={boardMetadata?.avatarUrl || "/"}
                  tagline={boardMetadata?.tagline || "loading..."}
                  accentColor={boardMetadata?.accentColor || "#f96680"}
                  muted={boardMetadata?.muted}
                  previewOptions={boardOptions}
                  descriptions={boardMetadata?.descriptions || []}
                  editing={editingSidebar}
                  onCancelEditing={stopEditing}
                  onUpdateMetadata={updateBoardMetadata}
                  activeCategory={categoryFilter?.[0]}
                  onCategoriesStateChange={onCategoriesStateChange}
                />
                {isBoardMetadataFetched &&
                  !boardMetadata?.descriptions.length &&
                  !editingSidebar && (
                    <img
                      className="under-construction"
                      src="/under_construction_icon.png"
                    />
                  )}
                {!isBoardMetadataFetched && (
                  <LoadingSpinner loading={!isBoardMetadataFetched} />
                )}
              </div>
            </FeedWithMenu.Sidebar>
            <FeedWithMenu.FeedContent>
              <div className="main">
                {showLockedMessage && (
                  <div className="locked">
                    <img src={"/locked.png"} />
                    <p>This board is restricted to logged-in users.</p>
                  </div>
                )}
                {showEmptyMessage && (
                  <img className="empty" src={"/nothing.jpg"} />
                )}
                {!showLockedMessage &&
                  boardActivityData?.pages &&
                  boardActivityData.pages
                    .flatMap((activityData) => activityData?.activity)
                    .map((thread: ThreadType) => {
                      return (
                        <div
                          className="post"
                          key={`${thread.threadId}_container`}
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
        {isLoggedIn && (
          <Layout.ActionButton>
            <NewThreadButton slug={slug} />
          </Layout.ActionButton>
        )}
      </Layout>
      <style jsx>{`
        .main {
          width: 100%;
          box-sizing: border-box;
        }
        .post.hidden {
          max-width: 500px;
          width: calc(100% - 40px);
          background-color: gray;
          padding: 20px;
          border: 1px dashed black;
          border-radius: 15px;
        }
        .post {
          margin: 20px auto;
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
        @media only screen and (max-width: 950px) {
          .garland {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
export default React.memo(BoardPage);
