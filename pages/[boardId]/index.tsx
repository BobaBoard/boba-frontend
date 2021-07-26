import React from "react";
import {
  FeedWithMenu,
  BoardSidebar,
  PostingActionButton,
} from "@bobaboard/ui-components";
import Layout from "../../components/Layout";
import { useInfiniteQuery } from "react-query";
import { useAuth } from "../../components/Auth";
import {
  useBoardContext,
  useBoardsContext,
} from "../../components/boards/BoardContext";
import { getBoardActivityData } from "../../utils/queries";
import { useUpdateBoardMetadata } from "../../components/hooks/queries/board";
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
import { ArrayParam, useQueryParams } from "use-query-params";

const log = debug("bobafrontend:BoardPage-log");
const info = debug("bobafrontend:BoardPage-info");
info.log = console.info.bind(console);

const NewThreadButton = withEditors<{ slug: string }>((props) => {
  const { boardsData } = useBoardsContext();
  const editorDispatch = useEditorsDispatch();
  return (
    <MemoizedActionButton
      accentColor={boardsData[props.slug]?.accentColor || "#f96680"}
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
  const boardData = useBoardContext(slug);
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
  React.useEffect(() => {
    setQuery({
      filter: undefined,
    });
  }, [slug, setQuery]);
  const updateBoardMetadata = useUpdateBoardMetadata({
    onSuccess: () => {
      setEditingSidebar(false);
    },
  });

  const onSetFilter = React.useCallback(
    (filter) => {
      setQuery({ filter: [filter] }, "replace");
    },
    [setQuery]
  );

  const {
    data: boardActivityData,
    isFetching: isFetchingBoardActivity,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ["boardActivityData", { slug, categoryFilter }],
    ({ pageParam = undefined }) =>
      getBoardActivityData(
        { slug, categoryFilter: categoryFilter?.[0] || null },
        pageParam
      ),
    {
      getNextPageParam: (lastGroup) => {
        return lastGroup?.nextPageCursor;
      },
      // Block this query for loggedInOnly boards (unless we're logged in)
      enabled: !boardData?.loggedInOnly || (!isAuthPending && isLoggedIn),
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  React.useEffect(() => {
    if (!isAuthPending && isLoggedIn) {
      log(`Marking board ${slug} as visited`);
      axios.get(`boards/${slug}/visit`);
    }
  }, [isAuthPending, isLoggedIn, slug]);

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
    !isAuthPending && !isLoggedIn && boardData?.loggedInOnly;
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
              <div>
                <MemoizedBoardSidebar
                  slug={boardData?.slug || slug}
                  avatarUrl={boardData?.avatarUrl || "/"}
                  tagline={boardData?.tagline || "loading..."}
                  accentColor={boardData?.accentColor || "#f96680"}
                  muted={boardData?.muted}
                  previewOptions={boardOptions}
                  descriptions={boardData?.descriptions || []}
                  editing={editingSidebar}
                  onCancelEditing={stopEditing}
                  onUpdateMetadata={updateBoardMetadata}
                  activeCategory={categoryFilter?.[0]}
                  onCategoriesStateChange={onCategoriesStateChange}
                />
                {!boardData?.descriptions && !editingSidebar && (
                  <img
                    className="under-construction"
                    src="/under_construction_icon.png"
                  />
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
              {!showLockedMessage &&
                !showEmptyMessage &&
                boardActivityData?.pages?.length && (
                  <LoadingSpinner
                    loading={isFetchingNextPage}
                    idleMessage={hasNextPage ? "..." : "Nothing more to load."}
                    loadingMessage={"Loading more"}
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
