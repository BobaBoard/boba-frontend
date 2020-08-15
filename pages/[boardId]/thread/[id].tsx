import React from "react";
import {
  FeedWithMenu,
  Comment,
  CommentChain,
  CommentHandler,
  CompactThreadIndent,
  useIndent,
  ThreadIndent,
  Post,
  PostSizes,
  PostHandler,
  CycleNewButton,
  toast,
  DefaultTheme,
  // @ts-ignore
} from "@bobaboard/ui-components";
import Layout from "../../../components/Layout";
import PostEditorModal from "../../../components/PostEditorModal";
import CommentEditorModal from "../../../components/CommentEditorModal";
import { useRouter } from "next/router";
import { getThreadData, markThreadAsRead } from "../../../utils/queries";
import { useQuery, useMutation, queryCache } from "react-query";
import { useAuth } from "../../../components/Auth";
import moment from "moment";
import debug from "debug";
import {
  PostType,
  CommentType,
  ThreadType,
  BoardActivityResponse,
} from "../../../types/Types";
import {
  makeCommentsTree,
  makePostsTree,
  getTotalContributions,
  getTotalNewContributions,
} from "../../../utils/thread-utils";
import classnames from "classnames";
import { useBoardTheme } from "../../../components/BoardTheme";
//import { useHotkeys } from "react-hotkeys-hook";

const log = debug("bobafrontend:thread-log");

// TODO: unify this and scrollToComment
const scrollToPost = (postId: string, color: string) => {
  log(`Beaming up to post with id ${postId}`);
  const element: HTMLElement | null = document.querySelector(
    `.post[data-post-id='${postId}']`
  );
  if (!element) {
    return;
  }
  const observer = new IntersectionObserver((observed) => {
    if (observed[0].isIntersecting) {
      postHandlers.get(postId)?.highlight(color), observer.disconnect();
    }
  });
  observer.observe(element);
  element.classList.add("outline-hidden");
  window.scroll({
    top:
      element.getBoundingClientRect().top +
      window.pageYOffset -
      (DefaultTheme.HEADER_HEIGHT_PX + 2),
    behavior: "smooth",
  });
};

const scrollToComment = (commentId: string, color: string) => {
  log(`Beaming up to comment with id ${commentId}`);
  const element: HTMLElement | null = document.querySelector(
    `.comment[data-comment-id='${commentId}']`
  );
  if (!element) {
    return;
  }
  const observer = new IntersectionObserver((observed) => {
    if (observed[0].isIntersecting) {
      commentHandlers.get(commentId)?.highlight(color), observer.disconnect();
    }
  });
  observer.observe(element);
  element.classList.add("outline-hidden");
  window.scroll({
    top:
      element.getBoundingClientRect().top +
      window.pageYOffset -
      (DefaultTheme.HEADER_HEIGHT_PX + 2),
    behavior: "smooth",
  });
};

const CommentsThreadLevel: React.FC<{
  comment: CommentType;
  comments: CommentType[];
  parentChainMap: Map<string, CommentType>;
  parentChildrenMap: Map<string, CommentType[]>;
  parentPostId: string;
  parentCommentId: string | null;
  isLoggedIn: boolean;
  level: number;
  onReplyTo: (replyTo: string) => void;
}> = (props) => {
  const indent = useIndent();
  const chain = [props.comment];
  let currentChainId = props.comment.commentId;
  while (props.parentChainMap.has(currentChainId)) {
    const next = props.parentChainMap.get(currentChainId) as CommentType;
    chain.push(next);
    currentChainId = next.commentId;
  }
  const lastCommentId = chain[chain.length - 1].commentId;
  const children = props.parentChildrenMap.get(lastCommentId);
  return (
    <CompactThreadIndent
      level={props.level}
      startsFromViewport={indent.bounds}
      hideLine={!children}
    >
      <div className="comment" data-comment-id={props.comment.commentId}>
        {chain.length > 1 ? (
          <CommentChain
            ref={(handler: CommentHandler) => {
              chain.forEach((el) => commentHandlers.set(el.commentId, handler));
              // Typescript marks this as a read-only property but there seems to be no
              // other way to do this. TODO: investigate.
              // @ts-ignore
              indent.handler.current = handler;
            }}
            key={props.comment.commentId}
            secretIdentity={props.comment.secretIdentity}
            userIdentity={props.comment.userIdentity}
            comments={chain.map((el) => ({
              id: el.commentId,
              text: el.content,
            }))}
            muted={props.isLoggedIn && !props.comment.isNew}
            onExtraAction={
              props.isLoggedIn
                ? () => props.onReplyTo(lastCommentId)
                : undefined
            }
          />
        ) : (
          <Comment
            ref={(handler: CommentHandler) => {
              commentHandlers.set(props.comment.commentId, handler);
              // Typescript marks this as a read-only property but there seems to be no
              // other way to do this. TODO: investigate.
              // @ts-ignore
              indent.handler.current = handler;
            }}
            key={props.comment.commentId}
            id={props.comment.commentId}
            secretIdentity={props.comment.secretIdentity}
            userIdentity={props.comment.userIdentity}
            initialText={props.comment.content}
            muted={props.isLoggedIn && !props.comment.isNew}
            onExtraAction={
              props.isLoggedIn
                ? () => props.onReplyTo(props.comment.commentId)
                : undefined
            }
          />
        )}
      </div>
      {children ? (
        <CommentsThread
          comments={props.comments}
          level={props.level + 1}
          parentCommentId={lastCommentId}
          parentPostId={props.parentPostId}
          isLoggedIn={props.isLoggedIn}
          onReplyTo={props.onReplyTo}
        />
      ) : (
        <></>
      )}
    </CompactThreadIndent>
  );
};

const commentHandlers = new Map<string, CommentHandler>();
const CommentsThread: React.FC<{
  comments: CommentType[];
  parentPostId: string;
  parentCommentId: string | null;
  isLoggedIn: boolean;
  level: number;
  onReplyTo: (replyTo: string) => void;
}> = (props) => {
  const { roots, parentChainMap, parentChildrenMap } = React.useMemo(
    () =>
      makeCommentsTree(
        props.comments,
        props.parentCommentId,
        props.parentPostId
      ),
    [props.comments]
  );
  return (
    <>
      {roots.map((comment: CommentType, i: number) => {
        return (
          <CommentsThreadLevel
            comment={comment}
            parentChainMap={parentChainMap}
            parentChildrenMap={parentChildrenMap}
            {...props}
          />
        );
      })}
    </>
  );
};

const postHandlers = new Map<string, PostHandler>();
const ThreadLevel: React.FC<{
  post: PostType;
  postsMap: Map<string, PostType[]>;
  level: number;
  onNewComment: (
    replyToPostId: string,
    replyToCommentId: string | null
  ) => void;
  onNewContribution: (id: string) => void;
  isLoggedIn: boolean;
  lastOf: { level: number; postId: string }[];
}> = (props) => {
  const router = useRouter();
  const slug = router.query.boardId?.slice(1) as string;
  const { [slug]: boardData } = useBoardTheme();
  log(
    `Rendering subtree at level ${props.level} starting with post with id ${props.post.postId}`
  );
  const isLeaf = !props.postsMap.get(props.post.postId)?.length;
  log(`Leaf post? ${isLeaf}`);
  const endsArray = isLeaf
    ? props.lastOf.map((ends) => ({
        level: ends.level,
        onBeamUpClick: () => {
          scrollToPost(ends.postId, boardData.accentColor);
        },
        showAddContribution: props.isLoggedIn,
        onAddContributionClick: () => {
          props.onNewContribution(ends.postId);
        },
      }))
    : [];
  log(`Ends array: %o`, endsArray);
  return (
    <>
      <div className="level">
        <ThreadIndent
          level={props.level}
          key={`${props.level}_${props.post.postId}`}
          ends={props.post.comments ? [] : endsArray}
        >
          <div className="post outline-hidden" data-post-id={props.post.postId}>
            <Post
              key={props.post.postId}
              ref={(handler: PostHandler) =>
                postHandlers.set(props.post.postId, handler)
              }
              size={
                props.post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR
              }
              createdTime={moment.utc(props.post.created).fromNow()}
              text={props.post.content}
              secretIdentity={props.post.secretIdentity}
              userIdentity={props.post.userIdentity}
              onNewContribution={() =>
                props.onNewContribution(props.post.postId)
              }
              onNewComment={() => props.onNewComment(props.post.postId, null)}
              totalComments={props.post.comments?.length}
              directContributions={
                props.postsMap.get(props.post.postId)?.length
              }
              totalContributions={getTotalContributions(
                props.post,
                props.postsMap
              )}
              newPost={props.isLoggedIn && props.post.isNew}
              newComments={props.isLoggedIn ? props.post.newCommentsAmount : 0}
              newContributions={
                props.isLoggedIn
                  ? getTotalNewContributions(props.post, props.postsMap)
                  : 0
              }
              centered={props.postsMap.size == 0}
              answerable={props.isLoggedIn}
              onNotesClick={() => {}}
              notesUrl={"#"}
              tags={props.post.tags}
              muted={props.isLoggedIn && !props.post.isNew && props.level > 0}
            />
          </div>
        </ThreadIndent>
        {props.post.comments && (
          <ThreadIndent
            level={props.level + 1}
            ends={
              isLeaf
                ? [
                    ...endsArray,
                    {
                      level: props.level,
                      onBeamUpClick: () =>
                        scrollToPost(props.post.postId, boardData.accentColor),
                      showAddContribution: props.isLoggedIn,
                      onAddContributionClick: () => {
                        props.onNewContribution(props.post.postId);
                      },
                    },
                  ]
                : []
            }
          >
            {
              <CommentsThread
                comments={props.post.comments}
                isLoggedIn={props.isLoggedIn}
                parentPostId={props.post.postId}
                parentCommentId={null}
                level={0}
                onReplyTo={(replyToCommentId: string) =>
                  props.onNewComment(props.post.postId, replyToCommentId)
                }
              />
            }
          </ThreadIndent>
        )}
        {props.postsMap
          .get(props.post.postId)
          ?.flatMap((post: PostType, index: number, array) => (
            <ThreadLevel
              key={post.postId}
              post={post}
              postsMap={props.postsMap}
              level={props.level + 1}
              onNewComment={props.onNewComment}
              onNewContribution={props.onNewContribution}
              isLoggedIn={props.isLoggedIn}
              lastOf={
                index == array.length - 1
                  ? [
                      ...props.lastOf,
                      { level: props.level, postId: props.post.postId },
                    ]
                  : props.lastOf
              }
            />
          ))}
        <style jsx>
          {`
            .level {
              width: 100%;
            }
            .post {
              margin-top: 15px;
              scroll-margin: 10px;
              position: relative;
            }
          `}
        </style>
      </div>
    </>
  );
};
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
  const threadId = router.query.id as string;
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
                <MemoizedThreadLevel
                  post={root}
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
