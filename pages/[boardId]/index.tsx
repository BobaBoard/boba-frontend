import React from "react";
import {
  FeedWithMenu,
  BoardSidebar,
  PostingActionButton,
} from "@bobaboard/ui-components";
import Layout from "../../components/Layout";
import { useInfiniteQuery } from "react-query";
import { useAuth } from "../../components/Auth";
import { useBoardContext } from "../../components/BoardContext";
import { getBoardActivityData } from "../../utils/queries";
import {
  useDismissBoardNotifications,
  useMuteBoard,
  usePinBoard,
  useUpdateBoardMetadata,
} from "../../components/hooks/queries/board";
import axios from "axios";
import debug from "debug";
import { ThreadType } from "../../types/Types";
import {
  faCommentSlash,
  faEdit,
  faThumbtack,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { BoardPageDetails, usePageDetails } from "utils/router-utils";
import LoadingSpinner from "components/LoadingSpinner";
import ThreadPreview from "components/ThreadPreview";
import {
  EditorActions,
  useEditorsDispatch,
} from "components/editors/EditorsContext";
import { withEditors } from "components/editors/withEditors";

const log = debug("bobafrontend:boardPage-log");
const info = debug("bobafrontend:boardPage-info");
info.log = console.info.bind(console);

const NewThreadButton = withEditors<{ slug: string }>((props) => {
  const { boardsData } = useBoardContext();
  const editorDispatch = useEditorsDispatch();
  return (
    <MemoizedActionButton
      accentColor={boardsData[props.slug]?.accentColor || "#f96680"}
      onNewPost={() => {
        editorDispatch({
          type: EditorActions.NEW_THREAD,
          payload: { boardSlug: props.slug },
        });
      }}
    />
  );
});

const MemoizedThreadPreview = React.memo(ThreadPreview);
const MemoizedActionButton = React.memo(PostingActionButton);
const MemoizedBoardSidebar = React.memo(BoardSidebar);
function BoardPage() {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const closeSidebar = React.useCallback(() => setShowSidebar(false), []);
  const { slug } = usePageDetails<BoardPageDetails>();
  const { isPending: isAuthPending, isLoggedIn } = useAuth();
  const { boardsData } = useBoardContext();
  const onTitleClick = React.useCallback(() => setShowSidebar(!showSidebar), [
    showSidebar,
  ]);
  const [editingSidebar, setEditingSidebar] = React.useState(false);
  const stopEditing = React.useCallback(() => setEditingSidebar(false), []);
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(
    null
  );
  React.useEffect(() => {
    setCategoryFilter(null);
  }, [slug]);
  const updateBoardMetadata = useUpdateBoardMetadata({
    onSuccess: () => {
      setEditingSidebar(false);
    },
  });
  const setBoardPinned = usePinBoard();
  const dismissNotifications = useDismissBoardNotifications();
  const setBoardMuted = useMuteBoard();

  const {
    data: boardActivityData,
    isFetching: isFetchingBoardActivity,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ["boardActivityData", { slug, categoryFilter }],
    ({ pageParam = undefined }) =>
      getBoardActivityData({ slug, categoryFilter }, pageParam),
    {
      getNextPageParam: (lastGroup) => {
        return lastGroup?.nextPageCursor;
      },
      // Block this query for loggedInOnly boards (unless we're logged in)
      enabled:
        !boardsData[slug]?.loggedInOnly || (!isAuthPending && isLoggedIn),
      keepPreviousData: true,
    }
  );

  const boardOptions = React.useMemo(() => {
    if (!isLoggedIn || !boardsData || !boardsData[slug]) {
      return undefined;
    }
    const options: any = [
      {
        icon: boardsData[slug].muted ? faVolumeUp : faVolumeMute,
        name: boardsData[slug].muted ? "Unmute" : "Mute",
        link: {
          onClick: () =>
            setBoardMuted({
              slug,
              mute: !boardsData[slug].muted,
            }),
        },
      },
      {
        icon: faThumbtack,
        name: !!boardsData[slug].pinnedOrder ? "Unpin" : "Pin",
        link: {
          onClick: () =>
            setBoardPinned({
              slug,
              pin: !boardsData[slug].pinnedOrder,
            }),
        },
      },
      {
        icon: faCommentSlash,
        name: "Dismiss notifications",
        link: {
          onClick: () => dismissNotifications({ slug }),
        },
      },
    ];
    if (boardsData[slug].permissions?.canEditBoardData) {
      options.push({
        icon: faEdit,
        name: "Edit Board",
        link: {
          onClick: () => setEditingSidebar(true),
        },
      });
    }
    return options;
  }, [isLoggedIn, boardsData[slug], slug]);

  React.useEffect(() => {
    if (!isAuthPending && isLoggedIn) {
      log(`Marking board ${slug} as visited`);
      axios.get(`boards/${slug}/visit`);
    }
  }, [isAuthPending, isLoggedIn, slug]);

  const showLockedMessage =
    !isAuthPending && !isLoggedIn && boardsData[slug]?.loggedInOnly;
  const showEmptyMessage =
    !showLockedMessage &&
    !isFetchingBoardActivity &&
    boardActivityData?.pages?.[0]?.activity?.length === 0;

  return (
    <div className="main">
      <Layout
        title={`!${slug}`}
        onCompassClick={onTitleClick}
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
                  // @ts-ignore
                  slug={boardsData[slug]?.slug || slug}
                  avatarUrl={boardsData[slug]?.avatarUrl || "/"}
                  tagline={boardsData[slug]?.tagline || "loading..."}
                  accentColor={boardsData[slug]?.accentColor || "#f96680"}
                  muted={boardsData[slug]?.muted}
                  previewOptions={boardOptions}
                  descriptions={boardsData[slug]?.descriptions || []}
                  editing={editingSidebar}
                  onCancelEditing={stopEditing}
                  onUpdateMetadata={updateBoardMetadata}
                  activeCategory={categoryFilter}
                  onCategoriesStateChange={React.useCallback((categories) => {
                    const activeCategories = categories.filter(
                      (category) => category.active
                    );
                    setCategoryFilter(
                      activeCategories.length == 1
                        ? activeCategories[0].name
                        : null
                    );
                  }, [])}
                />
                {!boardsData[slug]?.descriptions && !editingSidebar && (
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
                {boardActivityData?.pages &&
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
                            onSetCategoryFilter={setCategoryFilter}
                          />
                        </div>
                      );
                    })}
                {!showLockedMessage &&
                  !showEmptyMessage &&
                  boardActivityData?.pages?.length && (
                    <LoadingSpinner
                      loading={isFetchingNextPage}
                      idleMessage={
                        hasNextPage ? "..." : "Nothing more to load."
                      }
                      loadingMessage={"Loading more"}
                    />
                  )}
              </div>
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

export default withEditors(BoardPage);
