import React from "react";
import {
  FeedWithMenu,
  CycleNewButton,
  toast,
  PostingActionButton,
  // @ts-ignore
} from "@bobaboard/ui-components";
import Layout from "components/Layout";
import PostEditorModal from "components/PostEditorModal";
import CommentEditorModal from "components/CommentEditorModal";
import { useAuth } from "components/Auth";
import {
  PostType,
  CommentType,
  THREAD_VIEW_MODES,
  ThreadType,
} from "types/Types";
import { updateCommentCache, updatePostCache } from "utils/thread-utils";
import classnames from "classnames";
//import { useHotkeys } from "react-hotkeys-hook";
import ThreadView, {
  scrollToComment,
  scrollToPost,
} from "components/thread/ThreadView";
import ThreadSidebar from "components/thread/ThreadSidebar";
import GalleryThreadView from "components/thread/GalleryThreadView";
import TimelineThreadView from "components/thread/TimelineThreadView";
import { useRouter } from "next/router";
import { ThreadPageDetails, usePageDetails } from "../../../utils/router-utils";

import debug from "debug";
import useBoardsData from "components/hooks/useBoardsData";
import { useThreadData } from "components/hooks/useThreadData";
const log = debug("bobafrontend:threadPage-log");

const getViewTypeFromString = (
  viewString: ThreadType["defaultView"] | null
) => {
  if (!viewString) {
    return null;
  }
  switch (viewString) {
    case "gallery":
      return THREAD_VIEW_MODES.MASONRY;
    case "timeline":
      return THREAD_VIEW_MODES.TIMELINE;
    case "thread":
      return THREAD_VIEW_MODES.THREAD;
  }
};

const replyToComment = () => {};
const editPost = () => {};
const replyToPost = () => {};
const MemoizedThreadSidebar = React.memo(ThreadSidebar);
const MemoizedThreadView = React.memo(ThreadView);
const MemoizedGalleryThreadView = React.memo(GalleryThreadView);
const MemoizedTimelineThreadView = React.memo(TimelineThreadView);
const ThreadFeedContent: React.FC<{
  viewMode: THREAD_VIEW_MODES;
  postId: string | null;
  loading: boolean;
  displayAtMost: number;
}> = React.memo((props) => {
  return (
    <div
      className={classnames("feed", {
        thread: props.viewMode == THREAD_VIEW_MODES.THREAD || props.postId,
        masonry: props.viewMode == THREAD_VIEW_MODES.MASONRY && !props.postId,
        timeline: props.viewMode == THREAD_VIEW_MODES.TIMELINE && !props.postId,
        loading: props.loading,
      })}
    >
      <div className="view-modes">
        {props.viewMode == THREAD_VIEW_MODES.THREAD || props.postId ? (
          <MemoizedThreadView
            onNewComment={replyToComment}
            onNewContribution={replyToPost}
            onEditPost={editPost}
          />
        ) : props.viewMode == THREAD_VIEW_MODES.MASONRY ? (
          <MemoizedGalleryThreadView
            onNewComment={replyToComment}
            onNewContribution={replyToPost}
            displayAtMost={props.displayAtMost}
          />
        ) : (
          <MemoizedTimelineThreadView
            onNewComment={replyToComment}
            onNewContribution={replyToPost}
            displayAtMost={props.displayAtMost}
          />
        )}
      </div>
      <div
        className={classnames("loading-indicator", {
          loading: props.loading,
        })}
      >
        Loading...
      </div>
      <style jsx>
        {`
          .feed {
            max-width: 100%;
            padding-bottom: 70px;
            position: relative;
          }
          .feed.loading .view-modes {
            display: none;
          }
          .feed.timeline {
            width: 100%;
          }
          .feed.masonry {
            width: 100%;
            position: relative;
            margin-top: 20px;
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
          @media only screen and (max-width: 600px) {
            .feed:not(.loading)::after {
              content: "";
              background-image: url("/bobadab.png");
              background-size: contain;
              position: absolute;
              width: 50px;
              height: 50px;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
            }
          }
        `}
      </style>
    </div>
  );
});

function ThreadPage() {
  const [postReplyId, setPostReplyId] = React.useState<string | null>(null);
  const [postEdit, setPostEdit] = React.useState<PostType | null>(null);
  const [commentReplyId, setCommentReplyId] = React.useState<{
    postId: string | null;
    commentId: string | null;
  } | null>(null);
  const { postId, threadBaseUrl, slug, threadId } = usePageDetails<
    ThreadPageDetails
  >();
  const { user, isLoggedIn, isPending: isAuthPending } = useAuth();
  const router = useRouter();
  const {
    threadRoot,
    newAnswersSequence,
    isLoading: isFetchingThread,
    personalIdentity,
    defaultView,
    categories,
    readThread,
  } = useThreadData({ threadId, slug });
  const { currentBoardData } = useBoardsData();
  const [viewMode, setViewMode] = React.useState(
    getViewTypeFromString(defaultView) || THREAD_VIEW_MODES.THREAD
  );
  const [maxDisplay, setMaxDisplay] = React.useState(2);

  React.useEffect(() => {
    if (!isAuthPending && !isFetchingThread && isLoggedIn) {
      readThread();
      return;
    }
  }, [isAuthPending, isFetchingThread, isLoggedIn]);

  React.useEffect(() => {
    const url = new URL(`${window.location.origin}${router.asPath}`);
    if (url.searchParams.has("gallery")) {
      setViewMode(THREAD_VIEW_MODES.MASONRY);
    } else if (url.searchParams.has("timeline")) {
      setViewMode(THREAD_VIEW_MODES.TIMELINE);
    } else if (url.searchParams.has("thread")) {
      setViewMode(THREAD_VIEW_MODES.THREAD);
    } else {
      setViewMode(
        getViewTypeFromString(defaultView) || THREAD_VIEW_MODES.THREAD
      );
    }
  }, [router.asPath, isFetchingThread]);
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

  const onNewAnswersButtonClick = () => {
    if (!newAnswersSequence) {
      return;
    }
    log(newAnswersSequence);
    log(newAnswersIndex);
    // @ts-ignore
    newAnswersIndex.current =
      (newAnswersIndex.current + 1) % newAnswersSequence.length;
    const nextPost = newAnswersSequence[newAnswersIndex.current].postId;
    const nextComment = newAnswersSequence[newAnswersIndex.current].commentId;
    if (nextPost) {
      scrollToPost(nextPost, currentBoardData?.accentColor || "#f96680");
    }
    if (nextComment) {
      scrollToComment(nextComment, currentBoardData?.accentColor || "#f96680");
    }
  };

  const replyToComment = React.useCallback(
    (replyToPostId, replyToCommentId) =>
      setCommentReplyId({
        postId: replyToPostId,
        commentId: replyToCommentId,
      }),
    []
  );

  const canTopLevelPost =
    isLoggedIn &&
    (viewMode == THREAD_VIEW_MODES.MASONRY ||
      viewMode == THREAD_VIEW_MODES.TIMELINE);

  log(`Re-rendering ThreadPage`);
  return (
    <div className="main">
      {isLoggedIn && (
        <>
          <PostEditorModal
            isOpen={!!postReplyId || !!postEdit}
            secretIdentity={personalIdentity}
            userIdentity={{
              name: user?.username,
              avatar: user?.avatarUrl,
            }}
            // TODO: this transformation shouldn't be done here.
            additionalIdentities={
              !personalIdentity && currentBoardData?.postingIdentities
                ? currentBoardData.postingIdentities.map((identity) => ({
                    ...identity,
                    avatar: identity.avatarUrl,
                  }))
                : undefined
            }
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
              setPostEdit(null);
            }}
            onCloseModal={() => {
              setPostReplyId(null);
              setPostEdit(null);
            }}
            slug={slug}
            editPost={postEdit}
            replyToPostId={postReplyId}
            uploadBaseUrl={`images/${slug}/${router.query.id}/`}
            suggestedCategories={categories}
          />
          <CommentEditorModal
            isOpen={!!commentReplyId}
            userIdentity={{
              name: user?.username,
              avatar: user?.avatarUrl,
            }}
            secretIdentity={personalIdentity}
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
              <MemoizedThreadSidebar
                viewMode={viewMode}
                onViewChange={React.useCallback(
                  (viewMode) => {
                    const queryParam =
                      viewMode === THREAD_VIEW_MODES.MASONRY
                        ? "?gallery"
                        : viewMode == THREAD_VIEW_MODES.TIMELINE
                        ? "?timeline"
                        : "?thread";
                    router.push(
                      `/[boardId]/thread/[...threadId]`,
                      `${threadBaseUrl}${queryParam}`,
                      {
                        shallow: true,
                      }
                    );
                    setViewMode(viewMode);
                  },
                  [threadBaseUrl]
                )}
              />
            }
            feedContent={
              <ThreadFeedContent
                viewMode={viewMode}
                postId={postId}
                loading={isFetchingThread}
                displayAtMost={maxDisplay}
              />
            }
            onReachEnd={React.useCallback(() => {
              setMaxDisplay((maxDisplay) => maxDisplay + 2);
            }, [])}
          />
        }
        title={`!${slug}`}
        loading={isFetchingThread}
        actionButton={
          viewMode == THREAD_VIEW_MODES.THREAD &&
          !!newAnswersSequence.length ? (
            <CycleNewButton text="Next New" onNext={onNewAnswersButtonClick} />
          ) : canTopLevelPost ? (
            <PostingActionButton
              accentColor={currentBoardData?.accentColor || "#f96680"}
              onNewPost={() => threadRoot && setPostReplyId(threadRoot.postId)}
            />
          ) : undefined
        }
      />
    </div>
  );
}

export default ThreadPage;
