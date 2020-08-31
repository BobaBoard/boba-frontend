import React from "react";
import {
  FeedWithMenu,
  CycleNewButton,
  toast,
  // @ts-ignore
} from "@bobaboard/ui-components";
import Layout from "components/Layout";
import PostEditorModal from "components/PostEditorModal";
import CommentEditorModal from "components/CommentEditorModal";
import { ThreadProvider } from "components/thread/ThreadContext";
import { useAuth } from "components/Auth";
import { PostType, CommentType, THREAD_VIEW_MODES } from "types/Types";
import { updateCommentCache, updatePostCache } from "utils/thread-utils";
import classnames from "classnames";
import { useBoardTheme } from "components/BoardTheme";
//import { useHotkeys } from "react-hotkeys-hook";
import ThreadView, {
  scrollToComment,
  scrollToPost,
} from "components/thread/ThreadView";
import ThreadSidebar from "components/thread/ThreadSidebar";
import MasonryThreadView from "components/thread/MasonryThreadView";
import TimelineThreadView from "components/thread/TimelineThreadView";
import { useThread } from "components/thread/ThreadContext";
import { useRouter } from "next/router";

import debug from "debug";
import { NextPage } from "next";
const log = debug("bobafrontend:threadPage-log");

function ThreadPage() {
  const [postReplyId, setPostReplyId] = React.useState<string | null>(null);
  const [commentReplyId, setCommentReplyId] = React.useState<{
    postId: string | null;
    commentId: string | null;
  } | null>(null);
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const {
    threadId,
    slug,
    newAnswersSequence,
    isLoading: isFetchingThread,
    baseUrl,
  } = useThread();
  const { [slug]: boardData } = useBoardTheme();
  const [viewMode, setViewMode] = React.useState(THREAD_VIEW_MODES.THREAD);

  React.useEffect(() => {
    const url = new URL(`${window.location.origin}${router.asPath}`);
    if (url.searchParams.has("gallery")) {
      setViewMode(THREAD_VIEW_MODES.MASONRY);
    } else if (url.searchParams.has("timeline")) {
      setViewMode(THREAD_VIEW_MODES.TIMELINE);
    } else {
      setViewMode(THREAD_VIEW_MODES.THREAD);
    }
  }, [router.query.gallery, router.query.timeline, router.asPath]);
  const newAnswersIndex = React.useRef<number>(-1);

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
            forceHideSidebar={router.query.hideSidebar !== undefined}
            sidebarContent={
              <ThreadSidebar
                viewMode={viewMode}
                onViewChange={(viewMode) => {
                  const queryParam =
                    viewMode === THREAD_VIEW_MODES.MASONRY
                      ? "?gallery"
                      : viewMode == THREAD_VIEW_MODES.TIMELINE
                      ? "?timeline"
                      : "";
                  router.push(
                    `/[boardId]/thread/[...threadId]`,
                    `${baseUrl}${queryParam}`,
                    {
                      shallow: true,
                    }
                  );
                  setViewMode(viewMode);
                }}
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
                    <ThreadView
                      onNewComment={(replyToPostId, replyToCommentId) =>
                        setCommentReplyId({
                          postId: replyToPostId,
                          commentId: replyToCommentId,
                        })
                      }
                      onNewContribution={setPostReplyId}
                      isLoggedIn={isLoggedIn}
                    />
                  </div>
                ) : viewMode == THREAD_VIEW_MODES.MASONRY ? (
                  <div className="masonry-feed">
                    <MasonryThreadView
                      onNewComment={(replyToPostId, replyToCommentId) =>
                        setCommentReplyId({
                          postId: replyToPostId,
                          commentId: replyToCommentId,
                        })
                      }
                      onNewContribution={setPostReplyId}
                      isLoggedIn={isLoggedIn}
                    />
                  </div>
                ) : (
                  <div className="timeline-feed">
                    <TimelineThreadView
                      onNewComment={(replyToPostId, replyToCommentId) =>
                        setCommentReplyId({
                          postId: replyToPostId,
                          commentId: replyToCommentId,
                        })
                      }
                      onNewContribution={setPostReplyId}
                      isLoggedIn={isLoggedIn}
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
          !!newAnswersSequence.length ? (
            <CycleNewButton
              text="Next New"
              onNext={() => {
                if (!newAnswersSequence) {
                  return;
                }
                log(newAnswersSequence);
                log(newAnswersIndex);
                // @ts-ignore
                newAnswersIndex.current =
                  (newAnswersIndex.current + 1) % newAnswersSequence.length;
                const nextPost =
                  newAnswersSequence[newAnswersIndex.current].postId;
                const nextComment =
                  newAnswersSequence[newAnswersIndex.current].commentId;
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
          .feed {
            max-width: 100%;
          }
          .feed.masonry {
            width: 100%;
          }
          .masonry-feed {
            width: 100%;
            position: relative;
            margin-top: 20px;
            margin-bottom: 20px;
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
        `}
      </style>
    </div>
  );
}

export interface ThreadPageSSRContext {
  threadId: string;
  postId: string | null;
  slug: string;
}
const PageWithProvider: NextPage<{}> = (props) => {
  const router = useRouter();

  return (
    <ThreadProvider
      slug={(router.query.boardId as string).substring(1)}
      threadId={router.query.threadId?.[0] as string}
      postId={router.query.threadId?.[1] || null}
    >
      <ThreadPage />
    </ThreadProvider>
  );
};

// Without getInitialProps the router query will be undefined at first
PageWithProvider.getInitialProps = async () => {
  return {};
};

export default PageWithProvider;
