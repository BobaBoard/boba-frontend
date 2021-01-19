import React from "react";
import {
  Post,
  PostSizes,
  FeedWithMenu,
  BoardSidebar,
  PostingActionButton,
  toast,
  TagsType,
  TagType,
} from "@bobaboard/ui-components";
import Layout from "../../components/Layout";
import { useInfiniteQuery } from "react-query";
import { useAuth } from "../../components/Auth";
import { useBoardContext } from "../../components/BoardContext";
import { getBoardActivityData } from "../../utils/queries";
import {
  useMarkThreadAsRead,
  useMuteThread,
  useSetThreadHidden,
  useSetThreadView,
} from "../../components/hooks/queries/thread";
import {
  useDismissBoardNotifications,
  useMuteBoard,
  usePinBoard,
  useUpdateBoardMetadata,
} from "../../components/hooks/queries/board";
import { useRouter } from "next/router";
import axios from "axios";
import debug from "debug";
import moment from "moment";
import { PostType, ThreadType } from "../../types/Types";
import {
  faBookOpen,
  faCodeBranch,
  faCommentSlash,
  faEdit,
  faEye,
  faEyeSlash,
  faFilm,
  faFilter,
  faImages,
  faLink,
  faThumbtack,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import noop from "noop-ts";
import { useEditors } from "components/editors/useEditors";
import { BoardPageDetails, usePageDetails } from "utils/router-utils";

const log = debug("bobafrontend:boardPage-log");
const info = debug("bobafrontend:boardPage-info");
info.log = console.info.bind(console);

const BoardPost: React.FC<{
  thread: ThreadType;
  post: PostType;
  isLoggedIn: boolean;
  onSetCategoryFilter: (filter: string) => void;
}> = ({ post, thread, isLoggedIn, onSetCategoryFilter }) => {
  const router = useRouter();
  const slug: string = router.query.boardId?.slice(1) as string;
  const markThreadAsRead = useMarkThreadAsRead();
  const muteThread = useMuteThread();
  const setThreadHidden = useSetThreadHidden();
  const setThreadView = useSetThreadView();
  const { getLinkToThread } = useCachedLinks();
  const hasReplies =
    thread.totalPostsAmount > 1 || thread.totalCommentsAmount > 0;
  const threadUrl = `/${router.query.boardId}/thread/${thread.threadId}`;
  return (
    <Post
      key={post.postId}
      createdTime={`${moment.utc(post.created).fromNow()}${
        hasReplies
          ? ` [updated: ${moment.utc(thread.lastActivity).fromNow()}]`
          : ""
      }`}
      createdTimeLink={getLinkToThread({
        slug,
        threadId: thread.threadId,
      })}
      text={post.content}
      tags={post.tags}
      secretIdentity={post.secretIdentity}
      userIdentity={post.userIdentity}
      accessory={post.accessory}
      onNewContribution={noop}
      onNewComment={noop}
      size={post?.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR}
      newPost={isLoggedIn && !thread.muted && post.isNew}
      newComments={
        isLoggedIn ? (thread.muted ? undefined : thread.newCommentsAmount) : 0
      }
      newContributions={
        isLoggedIn
          ? thread.muted
            ? undefined
            : thread.newPostsAmount - (post.isNew ? 1 : 0)
          : 0
      }
      totalComments={thread.totalCommentsAmount}
      // subtract 1 since posts_amount is the amount of posts total in the thread
      // including the head one.-
      totalContributions={thread.totalPostsAmount - 1}
      directContributions={thread.directThreadsAmount}
      notesLink={getLinkToThread({
        slug,
        threadId: thread.threadId,
      })}
      muted={isLoggedIn && thread.muted}
      menuOptions={React.useMemo(
        () => [
          {
            icon: faLink,
            name: "Copy Link",
            link: {
              onClick: () => {
                const tempInput = document.createElement("input");
                tempInput.value = new URL(
                  threadUrl,
                  window.location.origin
                ).toString();
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand("copy");
                document.body.removeChild(tempInput);
                toast.success("Link copied!");
              },
            },
          },
          // Add options just for logged in users
          ...(isLoggedIn
            ? [
                {
                  icon: faBookOpen,
                  name: "Mark Read",
                  link: {
                    onClick: () => {
                      markThreadAsRead(thread.threadId);
                    },
                  },
                },
                {
                  icon: thread.muted ? faVolumeUp : faVolumeMute,
                  name: thread.muted ? "Unmute" : "Mute",
                  link: {
                    onClick: () => {
                      muteThread({
                        threadId: thread.threadId,
                        mute: !thread.muted,
                      });
                    },
                  },
                },
                {
                  icon: thread.hidden ? faEye : faEyeSlash,
                  name: thread.hidden ? "Unhide" : "Hide",
                  link: {
                    onClick: () => {
                      setThreadHidden({
                        threadId: thread.threadId,
                        hide: !thread.hidden,
                      });
                    },
                  },
                },
                ...(thread.posts[0]?.isOwn
                  ? [
                      {
                        icon: faEdit,
                        name: "Change default view",
                        options: [
                          {
                            icon: faCodeBranch,
                            name: "Thread",
                            link: {
                              onClick: () => {
                                setThreadView({
                                  threadId: thread.threadId,
                                  view: "thread",
                                });
                              },
                            },
                          },
                          {
                            icon: faImages,
                            name: "Gallery",
                            link: {
                              onClick: () => {
                                setThreadView({
                                  threadId: thread.threadId,
                                  view: "gallery",
                                });
                              },
                            },
                          },
                          {
                            icon: faFilm,
                            name: "Timeline",
                            link: {
                              onClick: () => {
                                setThreadView({
                                  threadId: thread.threadId,
                                  view: "timeline",
                                });
                              },
                            },
                          },
                        ].filter(
                          (option) =>
                            option.name.toLowerCase() != thread.defaultView
                        ),
                      },
                    ]
                  : []),
              ]
            : []),
        ],
        [isLoggedIn, thread]
      )}
      getOptionsForTag={React.useCallback((tag: TagsType) => {
        if (tag.type == TagType.CATEGORY) {
          return [
            {
              icon: faFilter,
              name: "Filter",
              link: {
                onClick: () => {
                  onSetCategoryFilter(tag.name);
                },
              },
            },
          ];
        }
        return undefined;
      }, [])}
    />
  );
};

const MemoizedBoardPost = React.memo(BoardPost);
const MemoizedActionButton = React.memo(PostingActionButton);
const MemoizedBoardSidebar = React.memo(BoardSidebar);
function BoardPage() {
  const { Editors, editorsProps, setNewThread } = useEditors();
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
  const setThreadHidden = useSetThreadHidden();
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

  const onNewThread = React.useCallback(() => setNewThread(true), []);

  const showLockedMessage =
    !isAuthPending && !isLoggedIn && boardsData[slug]?.loggedInOnly;
  const showEmptyMessage =
    !showLockedMessage &&
    !isFetchingBoardActivity &&
    boardActivityData?.pages?.[0]?.activity?.length === 0;

  return (
    <div className="main">
      <Editors {...editorsProps} />
      <Layout
        mainContent={
          <FeedWithMenu
            onCloseSidebar={closeSidebar}
            showSidebar={showSidebar}
            sidebarContent={
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
            }
            feedContent={
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
                      const post = thread.posts[0];
                      if (thread.hidden) {
                        return (
                          <div className="post hidden" key={thread.threadId}>
                            This thread was hidden{" "}
                            <a
                              href="#"
                              onClick={(e) => {
                                setThreadHidden({
                                  threadId: thread.threadId,
                                  hide: !thread.hidden,
                                });
                                e.preventDefault();
                              }}
                            >
                              [unhide]
                            </a>
                          </div>
                        );
                      }
                      return (
                        <div className="post" key={`${post.postId}_container`}>
                          <MemoizedBoardPost
                            post={post}
                            thread={thread}
                            isLoggedIn={isLoggedIn}
                            onSetCategoryFilter={setCategoryFilter}
                          />
                        </div>
                      );
                    })}
                <div className="loading">
                  {!showLockedMessage &&
                    !showEmptyMessage &&
                    boardActivityData?.pages?.length &&
                    (isFetchingNextPage
                      ? "Loading more..."
                      : hasNextPage
                      ? "..."
                      : "Nothing more to load")}
                </div>
              </div>
            }
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
          />
        }
        actionButton={
          isLoggedIn && (
            <MemoizedActionButton
              accentColor={boardsData[slug]?.accentColor || "#f96680"}
              onNewPost={onNewThread}
            />
          )
        }
        title={`!${slug}`}
        onCompassClick={onTitleClick}
        forceHideTitle={true}
      />
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

export default BoardPage;
