import React from "react";
import Link from "next/link";
import {
  FeedWithMenu,
  CycleNewButton,
  toast,
  // @ts-ignore
} from "@bobaboard/ui-components";
import Layout from "../../../components/Layout";
import PostEditorModal from "../../../components/PostEditorModal";
import CommentEditorModal from "../../../components/CommentEditorModal";
import { useRouter } from "next/router";
import { getThreadData, markThreadAsRead } from "../../../utils/queries";
import { useQuery, useMutation, queryCache } from "react-query";
import { useAuth } from "../../../components/Auth";
import debug from "debug";
import {
  PostType,
  CommentType,
  ThreadType,
  BoardActivityResponse,
} from "../../../types/Types";
import { makePostsTree } from "../../../utils/thread-utils";
import classnames from "classnames";
import { useBoardTheme } from "../../../components/BoardTheme";
//import { useHotkeys } from "react-hotkeys-hook";
import ThreadLevel, {
  scrollToComment,
  scrollToPost,
} from "../../../components/thread/ThreadLevel";
const log = debug("bobafrontend:threadPage-log");

const MemoizedThreadLevel = React.memo(ThreadLevel);

const getThreadInBoardCache = ({
  slug,
  threadId,
}: {
  slug: string;
  threadId: string;
}) => {
  const boardData:
    | BoardActivityResponse[]
    | undefined = queryCache.getQueryData(["boardActivityData", { slug }]);
  if (!boardData) {
    log(`Found no initial board activity data`);
    return undefined;
  }
  log(`Found initial board activity data for board ${slug}`);
  log(boardData);
  const thread = boardData
    .flatMap((data) => data.activity)
    .find((thread) => thread.threadId == threadId);
  if (!thread) {
    return undefined;
  }

  log(`Found thread:`);
  log(thread);
  return { thread, boardData };
};

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
      const threadResult = getThreadInBoardCache({ slug, threadId });
      if (threadResult) {
        log(`Found thread in cache:`);
        log(threadResult.thread);
        threadResult.thread.isNew = false;
        threadResult.thread.newCommentsAmount = 0;
        threadResult.thread.newPostsAmount = 0;

        threadResult.thread.posts.forEach((post) => {
          post.isNew = false;
          post.newCommentsAmount = 0;
          post.newPostsAmount = 0;
          post.comments?.forEach((comment) => {
            comment.isNew = false;
          });
        });

        queryCache.setQueryData(
          ["boardActivityData", { slug }],
          threadResult.boardData
        );
      }
    },
  });
  const { root, parentChildrenMap, postsDisplaySequence } = React.useMemo(
    () => makePostsTree(threadData?.posts, threadId),
    [threadData, threadId]
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

  if (!root) {
    return <div />;
  }

  const baseUrl = !!postId
    ? window.location.href.substring(0, window.location.href.lastIndexOf("/"))
    : window.location.href;
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
              const threadData = queryCache.getQueryData<ThreadType>([
                "threadData",
                { threadId },
              ]);
              if (!threadData) {
                log(
                  `Couldn't read thread data during post upload for thread id ${threadId}`
                );
                return;
              }
              threadData.posts = [...threadData.posts, post];
              queryCache.setQueryData(["threadData", { threadId }], () => ({
                ...threadData,
              }));
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
              const threadData = queryCache.getQueryData<ThreadType>([
                "threadData",
                { threadId },
              ]);
              if (!threadData) {
                log(
                  `Couldn't read thread data during comment upload for thread id ${threadId}`
                );
                return;
              }
              const parentIndex = threadData.posts.findIndex(
                (post) => post.postId == commentReplyId?.postId
              );
              log(`Found parent post with index ${parentIndex}`);
              if (parentIndex == -1) {
                toast.error("wtf");
                return;
              }
              threadData.posts[parentIndex] = {
                ...threadData.posts[parentIndex],
                newCommentsAmount:
                  threadData.posts[parentIndex].newCommentsAmount + 1,
                comments: [
                  ...(threadData.posts[parentIndex].comments || []),
                  ...comments,
                ],
              };
              queryCache.setQueryData(["threadData", { threadId }], () => ({
                ...threadData,
              }));
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
            sidebarContent={<div />}
            feedContent={
              <div className="feed-content">
                <div
                  className={classnames("whole-thread", {
                    visible: !!postId,
                  })}
                >
                  <Link href={baseUrl}>
                    <a>Show whole thread</a>
                  </Link>
                </div>
                <MemoizedThreadLevel
                  post={
                    !!postId
                      ? threadData.posts.find((post) => post.postId == postId)
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
            padding-bottom: 20px;
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

export default ThreadPage;
