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
import PostEditorModal from "../../components/editors/PostEditorModal";
import { useInfiniteQuery, queryCache, useMutation } from "react-query";
import { useAuth } from "../../components/Auth";
import { useBoardContext } from "../../components/BoardContext";
import {
  getBoardActivityData,
  markThreadAsRead,
  muteThread,
  hideThread,
} from "../../utils/queries";
import {
  updateBoardSettings,
  muteBoard,
  dismissBoardNotifications,
  pinBoard,
} from "../../utils/queries/board";
import {
  removeThreadActivityFromCache,
  setBoardMutedInCache,
  setBoardPinnedInCache,
  setDefaultThreadViewInCache,
  setThreadHiddenInCache,
  setThreadMutedInCache,
} from "../../utils/queries/cache";
import { useRouter } from "next/router";
import axios from "axios";
import debug from "debug";
import moment from "moment";
import {
  BoardData,
  BoardDescription,
  PostType,
  ThreadType,
} from "../../types/Types";
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
import { updateThreadView } from "utils/queries/post";

const error = debug("bobafrontend:boardPage-error");
const log = debug("bobafrontend:boardPage-log");
const info = debug("bobafrontend:boardPage-info");
info.log = console.info.bind(console);

const BoardPost: React.FC<{
  thread: ThreadType;
  post: PostType;
  isLoggedIn: boolean;
  onReadThread: (threadId: string) => void;
  onSetCategoryFilter: (filter: string) => void;
  onHideThread: (data: { threadId: string; hide: boolean }) => void;
  onMuteThread: (data: { threadId: string; mute: boolean }) => void;
  onChangeThreadView: (data: {
    threadId: string;
    view: ThreadType["defaultView"];
  }) => void;
}> = ({
  post,
  thread,
  isLoggedIn,
  onHideThread,
  onMuteThread,
  onReadThread,
  onSetCategoryFilter,
  onChangeThreadView,
}) => {
  const router = useRouter();
  const slug: string = router.query.boardId?.slice(1) as string;
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
                      onReadThread(thread.threadId);
                    },
                  },
                },
                {
                  icon: thread.muted ? faVolumeUp : faVolumeMute,
                  name: thread.muted ? "Unmute" : "Mute",
                  link: {
                    onClick: () => {
                      onMuteThread({
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
                      onHideThread({
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
                                onChangeThreadView({
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
                                onChangeThreadView({
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
                                onChangeThreadView({
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
  const [postEditorOpen, setPostEditorOpen] = React.useState(false);
  const openPostEditor = React.useCallback(() => setPostEditorOpen(true), []);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const closeSidebar = React.useCallback(() => setShowSidebar(false), []);
  const router = useRouter();
  const slug: string = router.query.boardId?.slice(1) as string;
  const { isPending, isLoggedIn, user } = useAuth();
  const { boardsData, nextPinnedOrder } = useBoardContext();
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

  const {
    data: boardActivityData,
    isFetching: isFetchingBoardActivity,
    isFetchingMore,
    fetchMore,
    canFetchMore,
  } = useInfiniteQuery(
    ["boardActivityData", { slug, categoryFilter }],
    getBoardActivityData,
    {
      getFetchMore: (lastGroup, allGroups) => {
        // TODO: if this method fires too often in a row, sometimes there's duplicate
        // values within allGroups (aka groups fetched with the same cursor).
        // This seems to be a library problem.
        return lastGroup?.nextPageCursor;
      },
    }
  );

  const [readThread] = useMutation(
    (threadId: string) => markThreadAsRead({ threadId }),
    {
      onMutate: (threadId) => {
        log(`Optimistically marking thread ${threadId} as visited.`);
        removeThreadActivityFromCache({ slug, categoryFilter, threadId });
      },
      onError: (error: Error, threadId) => {
        toast.error("Error while marking thread as visited");
        log(`Error while marking thread ${threadId} as visited:`);
        log(error);
      },
      onSuccess: (data: boolean, threadId) => {
        log(`Successfully marked thread ${threadId} as visited.`);
      },
    }
  );

  const [setThreadMuted] = useMutation(
    ({ threadId, mute }: { threadId: string; mute: boolean }) =>
      muteThread({ threadId, mute }),
    {
      onMutate: ({ threadId, mute }) => {
        log(
          `Optimistically marking thread ${threadId} as ${
            mute ? "muted" : "unmuted"
          }.`
        );
        setThreadMutedInCache({ slug, categoryFilter, threadId, mute });
      },
      onError: (error: Error, { threadId, mute }) => {
        toast.error(
          `Error while marking thread as ${mute ? "muted" : "unmuted"}`
        );
        log(`Error while marking thread ${threadId} as muted:`);
        log(error);
      },
      onSuccess: (data: boolean, { threadId, mute }) => {
        log(
          `Successfully marked thread ${threadId} as  ${
            mute ? "muted" : "unmuted"
          }.`
        );
        queryCache.invalidateQueries("allBoardsData");
      },
    }
  );

  const [setThreadView] = useMutation(
    ({
      threadId,
      view,
    }: {
      threadId: string;
      view: ThreadType["defaultView"];
    }) => updateThreadView({ threadId, view }),
    {
      onMutate: ({ threadId, view }) => {
        log(
          `Optimistically switched thread ${threadId} to default view ${view}.`
        );
        setDefaultThreadViewInCache({ slug, categoryFilter, threadId, view });
      },
      onError: (error: Error, { threadId, view }) => {
        toast.error(
          `Error while switching thread ${threadId} to default view ${view}.`
        );
        log(error);
      },
      onSuccess: (_, { threadId, view }) => {
        log(
          `Successfully switched thread ${threadId} to default view ${view}.`
        );
        toast.success("Successfully updated thread view!");
      },
    }
  );

  const [setBoardMuted] = useMutation(
    ({ slug, mute }: { slug: string; mute: boolean }) =>
      muteBoard({ slug, mute }),
    {
      onMutate: ({ slug, mute }) => {
        log(
          `Optimistically marking board ${slug} as ${
            mute ? "muted" : "unmuted"
          }.`
        );
        setBoardMutedInCache({ slug, mute });
      },
      onError: (error: Error, { slug, mute }) => {
        toast.error(
          `Error while marking board as ${mute ? "muted" : "unmuted"}`
        );
        log(`Error while marking board ${slug} as muted:`);
        log(error);
      },
      onSuccess: (data: boolean, { slug, mute }) => {
        log(
          `Successfully marked board ${slug} as  ${mute ? "muted" : "unmuted"}.`
        );
        queryCache.invalidateQueries("allBoardsData");
      },
    }
  );

  const [setBoardPinned] = useMutation(
    ({ slug, pin }: { slug: string; pin: boolean }) => pinBoard({ slug, pin }),
    {
      onMutate: ({ slug, pin }) => {
        log(
          `Optimistically marking board ${slug} as ${
            pin ? "pinned" : "unpinned"
          }.`
        );
        setBoardPinnedInCache({ slug, pin, nextPinnedOrder });
      },
      onError: (error: Error, { slug, pin }) => {
        toast.error(
          `Error while marking board as ${pin ? "pinned" : "unpinned"}`
        );
        log(
          `Error while marking board ${slug} as ${pin ? "pinned" : "unpinned"}:`
        );
        log(error);
      },
      onSuccess: (data: boolean, { slug, pin }) => {
        log(
          `Successfully marked board ${slug} as ${pin ? "pinned" : "unpinned"}.`
        );
        queryCache.invalidateQueries("allBoardsData");
      },
    }
  );

  const [dismissNotifications] = useMutation(
    ({ slug }: { slug: string }) => dismissBoardNotifications({ slug }),
    {
      onSuccess: () => {
        log(`Successfully dismissed board notifications. Refetching...`);
        queryCache.invalidateQueries("allBoardsData");
        queryCache.invalidateQueries(["boardActivityData", { slug }]);
      },
    }
  );

  const [setThreadHidden] = useMutation(
    ({ threadId, hide }: { threadId: string; hide: boolean }) =>
      hideThread({ threadId, hide }),
    {
      onMutate: ({ threadId, hide }) => {
        log(
          `Optimistically marking thread ${threadId} as ${
            hide ? "hidden" : "visible"
          }.`
        );
        setThreadHiddenInCache({ slug, categoryFilter, threadId, hide });
      },
      onError: (error: Error, { threadId, hide }) => {
        toast.error(
          `Error while marking thread as ${hide ? "hidden" : "visible"}`
        );
        log(`Error while marking thread ${threadId} as hidden:`);
        log(error);
      },
      onSuccess: (data: boolean, { threadId, hide }) => {
        log(
          `Successfully marked thread ${threadId} as  ${
            hide ? "hidden" : "visible"
          }.`
        );
        queryCache.invalidateQueries("allBoardsData");
      },
    }
  );

  const [updateBoardMetadata] = useMutation(
    ({
      slug,
      descriptions,
      accentColor,
      tagline,
    }: {
      slug: string;
      descriptions: BoardDescription[];
      accentColor: string;
      tagline: string;
    }) => updateBoardSettings({ slug, descriptions, accentColor, tagline }),
    {
      onError: (serverError: Error, { descriptions }) => {
        toast.error("Error while updating the board sidebar.");
        error(serverError);
      },
      onSuccess: (data: BoardData) => {
        log(`Received comment data after save:`);
        log(data);
        setEditingSidebar(false);
        queryCache.setQueryData(["boardThemeData", { slug }], data);
        queryCache.invalidateQueries("allBoardsData");
      },
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
    if (!isPending && isLoggedIn) {
      log(`Marking board ${slug} as visited`);
      axios.get(`boards/${slug}/visit`);
    }
  }, [isPending, isLoggedIn, slug]);

  const showEmptyMessage =
    !isFetchingBoardActivity && boardActivityData?.[0]?.activity?.length === 0;

  return (
    <div className="main">
      {isLoggedIn && (
        <PostEditorModal
          isOpen={postEditorOpen}
          userIdentity={{
            name: user?.username,
            avatar: user?.avatarUrl,
          }}
          // TODO: this transformation shouldn't be done here.
          additionalIdentities={
            boardsData[slug]?.postingIdentities
              ? boardsData[slug].postingIdentities?.map((identity) => ({
                  ...identity,
                  avatar: identity.avatarUrl,
                }))
              : undefined
          }
          onPostSaved={(post: any) => {
            queryCache.invalidateQueries(["boardActivityData", { slug }]);
            setPostEditorOpen(false);
          }}
          onCloseModal={() => setPostEditorOpen(false)}
          slug={slug}
          replyToPostId={null}
          uploadBaseUrl={`images/${slug}/`}
          suggestedCategories={boardsData[slug]?.suggestedCategories}
        />
      )}
      <Layout
        mainContent={
          <FeedWithMenu
            onCloseSidebar={closeSidebar}
            showSidebar={showSidebar}
            sidebarContent={
              <>
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
              </>
            }
            feedContent={
              <div className="main">
                {showEmptyMessage && (
                  <img className="empty" src={"/nothing.jpg"} />
                )}
                {boardActivityData &&
                  boardActivityData
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
                            onHideThread={setThreadHidden}
                            onMuteThread={setThreadMuted}
                            onReadThread={readThread}
                            onSetCategoryFilter={setCategoryFilter}
                            onChangeThreadView={setThreadView}
                          />
                        </div>
                      );
                    })}
                <div className="loading">
                  {!showEmptyMessage &&
                    boardActivityData?.length &&
                    (isFetchingMore
                      ? "Loading more..."
                      : canFetchMore
                      ? "..."
                      : "Nothing more to load")}
                </div>
              </div>
            }
            onReachEnd={React.useCallback(() => {
              info(`Attempting to fetch more...`);
              info(canFetchMore);
              if (canFetchMore && !isFetchingMore) {
                info(`...found stuff!`);
                fetchMore();
                return;
              }
              info(
                isFetchingMore
                  ? `...but we're already fetching`
                  : `...but there's nothing!`
              );
            }, [canFetchMore, isFetchingMore, fetchMore])}
          />
        }
        actionButton={
          isLoggedIn && (
            <MemoizedActionButton
              accentColor={boardsData[slug]?.accentColor || "#f96680"}
              onNewPost={openPostEditor}
            />
          )
        }
        title={`!${slug}`}
        onTitleClick={onTitleClick}
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

export default BoardPage;
