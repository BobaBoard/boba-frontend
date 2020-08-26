import React from "react";
import Link from "next/link";
import {
  FeedWithMenu,
  CycleNewButton,
  toast,
  // @ts-ignore
} from "@bobaboard/ui-components";
import Layout from "components/Layout";
import PostEditorModal from "components/PostEditorModal";
import CommentEditorModal from "components/CommentEditorModal";
import { useRouter } from "next/router";
import { getThreadData, markThreadAsRead } from "utils/queries";
import { useQuery, useMutation } from "react-query";
import { useAuth } from "components/Auth";
import debug from "debug";
import { PostType, CommentType, THREAD_VIEW_MODES } from "types/Types";
import {
  makePostsTree,
  extractCategories,
  applyCategoriesFilter,
  updateCommentCache,
  updatePostCache,
  getThreadInBoardCache,
  updateThreadReadState,
} from "utils/thread-utils";
import classnames from "classnames";
import { useBoardTheme } from "components/BoardTheme";
//import { useHotkeys } from "react-hotkeys-hook";
import ThreadLevel, {
  scrollToComment,
  scrollToPost,
} from "components/thread/ThreadLevel";
import ThreadSidebar from "components/thread/ThreadSidebar";
import MasonryThreadView from "components/thread/MasonryThreadView";
import TimelineThreadView from "components/thread/TimelineThreadView";
const log = debug("bobafrontend:threadPage-log");

const MemoizedThreadLevel = React.memo(ThreadLevel);

function ThreadPage() {
  const [postReplyId, setPostReplyId] = React.useState<string | null>(null);
  const [commentReplyId, setCommentReplyId] = React.useState<{
    postId: string | null;
    commentId: string | null;
  } | null>(null);
  const router = useRouter();
  console.log(router.query.threadId);
  const threadId = router.query.threadId?.[0] as string;
  const postId = router.query.threadId?.[1] as string;
  const { user, isLoggedIn } = useAuth();
  const slug: string = router.query.boardId?.slice(1) as string;
  const [viewMode, setViewMode] = React.useState(THREAD_VIEW_MODES.TIMELINE);
  const [categoryFilterState, setCategoryFilterState] = React.useState<
    {
      name: string;
      active: boolean;
    }[]
  >([]);
  const { data: threadData, isFetching: isFetchingThread } = useQuery(
    ["threadData", { threadId }],
    getThreadData,
    {
      refetchOnWindowFocus: false,
      initialData: () => {
        log(
          `Searching board activity data for board ${slug} and thread ${threadId}`
        );
        return getThreadInBoardCache({ slug, threadId })?.thread;
      },
      onSuccess: () => {
        log(`Retrieved thread data for thread with id ${threadId}`);
        if (isLoggedIn) {
          readThread();
        }
      },
      initialStale: true,
    }
  );
  const { [slug]: boardData } = useBoardTheme();

  const [readThread] = useMutation(() => markThreadAsRead({ threadId }), {
    onSuccess: () => {
      log(`Successfully marked thread as read`);
      updateThreadReadState({ threadId, slug });
    },
  });
  const { root, parentChildrenMap, postsDisplaySequence } = React.useMemo(
    () => makePostsTree(threadData?.posts, threadId),
    [threadData, threadId]
  );

  React.useEffect(() => {
    if (!threadData) {
      setCategoryFilterState([]);
    }
    const currentCategories = extractCategories(threadData?.posts);
    setCategoryFilterState(
      currentCategories.map((category) => ({
        name: category,
        active:
          categoryFilterState.find(
            (stateCategory) => stateCategory.name == category
          )?.active || true,
      }))
    );
  }, [threadData, threadId]);

  React.useEffect(() => {
    if (router.query.gallery == "true") {
      setViewMode(THREAD_VIEW_MODES.MASONRY);
    }
  }, [router.query.gallery]);

  const {
    root: filteredRoot,
    parentChildrenMap: filteredParentChildrenMap,
  } = React.useMemo(
    () => applyCategoriesFilter(root, parentChildrenMap, categoryFilterState),
    [root, parentChildrenMap, categoryFilterState]
  );

  // TODO: disable this while post editing and readd
  // const currentPostIndex = React.useRef<number>(-1);
  // useHotkeys(
  //   "n",
  //   () => {
  //     if (!postsDisplaySequence) {
  //       return;
  //     }
  //     currentPostIndex.current =
  //       (currentPostIndex.current + 1) % postsDisplaySequence.length;
  //     scrollToPost(
  //       postsDisplaySequence[currentPostIndex.current].postId,
  //       boardData.accentColor
  //     );
  //   },
  //   [postsDisplaySequence]
  // );
  const newAnswersIndex = React.useRef<number>(-1);
  const newAnswersArray = React.useRef<
    { postId?: string; commentId?: string }[]
  >([]);
  React.useEffect(() => {
    newAnswersIndex.current = -1;
    newAnswersArray.current = [];
    if (!postsDisplaySequence) {
      return;
    }
    postsDisplaySequence.forEach((post) => {
      if (post.isNew && post.parentPostId != null) {
        newAnswersArray.current.push({ postId: post.postId });
      }
      post.comments?.forEach((comment) => {
        if (comment.isNew && !comment.chainParentId) {
          newAnswersArray.current.push({ commentId: comment.commentId });
        }
      });
    });
  }, [postsDisplaySequence]);

  if (!filteredRoot) {
    return <div />;
  }

  const pathnameNoTrailingSlash =
    window.location.pathname[window.location.pathname.length - 1] == "/"
      ? window.location.pathname.substr(0, window.location.pathname.length - 1)
      : window.location.pathname;
  const baseUrl = !!postId
    ? pathnameNoTrailingSlash.substring(
        0,
        pathnameNoTrailingSlash.lastIndexOf("/") + 1
      )
    : pathnameNoTrailingSlash;
  return (
    <div className="main">
      {isLoggedIn && (
        <>
          <PostEditorModal
            isOpen={!!postReplyId}
            userIdentity={{
              name: user?.username,
              avatar: user?.avatarUrl,
            }}
            onPostSaved={(post: PostType) => {
              log(
                `Saved new prompt to thread ${threadId}, replying to post ${postReplyId}.`
              );
              log(post);
              if (!updatePostCache({ threadId, post })) {
                toast.error(
                  `Error updating post cache after posting new comment.`
                );
              }
              setPostReplyId(null);
            }}
            onCloseModal={() => setPostReplyId(null)}
            slug={slug}
            replyToPostId={postReplyId}
            uploadBaseUrl={`images/${slug}/${router.query.id}/`}
          />
          <CommentEditorModal
            isOpen={!!commentReplyId}
            userIdentity={{
              name: user?.username,
              avatar: user?.avatarUrl,
            }}
            onCommentsSaved={(comments: CommentType[]) => {
              log(
                `Saved new comment(s) to thread ${threadId}, replying to post ${commentReplyId}.`
              );
              log(comments);
              if (
                !commentReplyId ||
                !updateCommentCache({
                  threadId,
                  newComments: comments,
                  replyTo: commentReplyId,
                })
              ) {
                toast.error(
                  `Error updating comment cache after posting new comment.`
                );
              }
              setCommentReplyId(null);
            }}
            onCloseModal={() => setCommentReplyId(null)}
            replyTo={commentReplyId}
          />
        </>
      )}
      <Layout
        mainContent={
          <FeedWithMenu
            forceHideSidebar={router.query.gallery == "true"}
            sidebarContent={
              <ThreadSidebar
                firstPost={filteredRoot}
                categoryFilters={categoryFilterState}
                onFiltersStatecChange={setCategoryFilterState}
                viewMode={viewMode}
                onViewChange={setViewMode}
              />
            }
            feedContent={
              <div
                className={classnames("feed", {
                  thread: viewMode == THREAD_VIEW_MODES.THREAD,
                  masonry: viewMode == THREAD_VIEW_MODES.MASONRY,
                  timeline: viewMode == THREAD_VIEW_MODES.TIMELINE,
                })}
              >
                {viewMode == THREAD_VIEW_MODES.THREAD ? (
                  <div className="feed-content">
                    <div
                      className={classnames("whole-thread", {
                        visible: !!postId,
                      })}
                    >
                      <Link
                        as={baseUrl}
                        href={`/[boardId]/thread/[...threadId]`}
                        shallow={true}
                      >
                        <a>Show whole thread</a>
                      </Link>
                    </div>
                    <MemoizedThreadLevel
                      post={
                        !!postId && threadData
                          ? (threadData.posts.find(
                              (post) => post.postId == postId
                            ) as PostType)
                          : root
                      }
                      postsMap={parentChildrenMap}
                      level={0}
                      onNewComment={(replyToPostId, replyToCommentId) =>
                        setCommentReplyId({
                          postId: replyToPostId,
                          commentId: replyToCommentId,
                        })
                      }
                      onNewContribution={setPostReplyId}
                      isLoggedIn={isLoggedIn}
                      lastOf={[]}
                    />
                  </div>
                ) : viewMode == THREAD_VIEW_MODES.MASONRY ? (
                  <div className="masonry-feed">
                    <MasonryThreadView
                      posts={threadData?.posts}
                      postsMap={filteredParentChildrenMap}
                      categoryFilters={categoryFilterState}
                      onNewComment={(replyToPostId, replyToCommentId) =>
                        setCommentReplyId({
                          postId: replyToPostId,
                          commentId: replyToCommentId,
                        })
                      }
                      onNewContribution={setPostReplyId}
                      isLoggedIn={isLoggedIn}
                      lastOf={[]}
                    />
                  </div>
                ) : (
                  <div className="timeline-feed">
                    <TimelineThreadView
                      posts={threadData?.posts}
                      postsMap={filteredParentChildrenMap}
                      categoryFilters={categoryFilterState}
                      onNewComment={(replyToPostId, replyToCommentId) =>
                        setCommentReplyId({
                          postId: replyToPostId,
                          commentId: replyToCommentId,
                        })
                      }
                      onNewContribution={setPostReplyId}
                      isLoggedIn={isLoggedIn}
                      lastOf={[]}
                    />
                  </div>
                )}

                <div
                  className={classnames("loading-indicator", {
                    loading: isFetchingThread,
                  })}
                >
                  Loading...
                </div>
              </div>
            }
          />
        }
        title={`!${slug}`}
        onTitleClick={() => {
          router
            .push(`/[boardId]`, `/!${slug}`, {
              shallow: true,
            })
            .then(() => {
              window.scrollTo(0, 0);
            });
        }}
        loading={isFetchingThread}
        actionButton={
          !!newAnswersArray.current?.length ? (
            <CycleNewButton
              text="Next New"
              onNext={() => {
                if (!newAnswersArray.current) {
                  return;
                }
                newAnswersIndex.current =
                  (newAnswersIndex.current + 1) %
                  newAnswersArray.current.length;
                const nextPost =
                  newAnswersArray.current[newAnswersIndex.current].postId;
                const nextComment =
                  newAnswersArray.current[newAnswersIndex.current].commentId;
                if (nextPost) {
                  scrollToPost(nextPost, boardData.accentColor);
                }
                if (nextComment) {
                  scrollToComment(nextComment, boardData.accentColor);
                }
              }}
            />
          ) : undefined
        }
      />
      <style jsx>
        {`
          .feed-content {
            max-width: 100%;
            padding-bottom: 40px;
          }
          .feed.masonry {
            width: 100%;
          }
          .masonry-feed {
            width: 100%;
            position: relative;
          }
          .loading-indicator {
            color: white;
            width: 100%;
            text-align: center;
            padding: 20px;
            display: none;
          }
          .loading-indicator.loading {
            display: block;
          }
          .whole-thread {
            margin-bottom: -5px;
            padding-top: 10px;
            display: none;
          }
          .whole-thread.visible {
            display: block;
          }
          .whole-thread a {
            color: white;
            font-size: 13px;
          }
        `}
      </style>
    </div>
  );
}

export default ThreadPage;
