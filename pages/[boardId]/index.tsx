import React from "react";
import {
  Post,
  PostSizes,
  FeedWithMenu,
  BoardSidebar,
  PostingActionButton,
  toast,
  // @ts-ignore
} from "@bobaboard/ui-components";
import Layout from "../../components/Layout";
import PostEditorModal from "../../components/PostEditorModal";
import { useInfiniteQuery, queryCache, useMutation } from "react-query";
import { useAuth } from "../../components/Auth";
import { useBoardTheme } from "../../components/BoardTheme";
import { getBoardActivityData, markThreadAsRead } from "../../utils/queries";
import { useRouter } from "next/router";
import axios from "axios";
import debug from "debug";
import moment from "moment";
import { PostType, BoardActivityResponse } from "../../types/PostTypes";

const error = debug("bobafrontend:boardPage-error");
const log = debug("bobafrontend:boardPage-log");
const info = debug("bobafrontend:boardPage-info");

function BoardPage() {
  const [postEditorOpen, setPostEditorOpen] = React.useState(false);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const router = useRouter();
  const slug: string = router.query.boardId?.slice(1) as string;
  const { isPending, isLoggedIn, user } = useAuth();
  const { [slug]: boardData } = useBoardTheme();
  const threadRedirectMethod = React.useRef(new Map<string, () => void>());

  const {
    data: boardActivityData,
    isFetching: isFetchingBoardActivity,
    isFetchingMore,
    fetchMore,
    canFetchMore,
  } = useInfiniteQuery(["boardActivityData", { slug }], getBoardActivityData, {
    getFetchMore: (lastGroup, allGroups) => {
      log(`Fetching next threads page`);
      log(lastGroup);
      return lastGroup?.nextPageCursor;
    },
  });

  // @ts-ignore
  const [readThread] = useMutation(
    (threadId: string) => markThreadAsRead({ threadId }),
    {
      onMutate: (threadId) => {
        log(`Optimistically marking thread ${threadId} as visited.`);
        const boardActivityData = queryCache.getQueryData<
          BoardActivityResponse[]
        >(["boardActivityData", { slug }]);

        const updatedPost = boardActivityData
          ?.flatMap((data) => data.activity)
          .find((post) => post.threadId == threadId);

        if (!updatedPost) {
          error(
            `Post wasn't found in data after marking thread ${threadId} as visited`
          );
          return;
        }
        updatedPost.isNew = false;
        updatedPost.newCommentsAmount = 0;
        updatedPost.newPostsAmount = 0;
        queryCache.setQueryData(
          ["boardActivityData", { slug }],
          () => boardActivityData
        );
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

  React.useEffect(() => {
    if (!isPending && isLoggedIn) {
      log(`Marking board ${slug} as visited`);
      axios.get(`boards/${slug}/visit`);
    }
  }, [isPending, isLoggedIn, slug]);

  const getMemoizedRedirectMethod = (threadId: string) => {
    if (!threadRedirectMethod.current?.has(threadId)) {
      info(`Creating new handler for thread id: ${threadId}`);
      threadRedirectMethod.current?.set(threadId, () =>
        router.push(
          `/[boardId]/thread/[id]`,
          `/${router.query.boardId}/thread/${threadId}`,
          {
            shallow: true,
          }
        )
      );
    }
    info(`Returning handler for thread id: ${threadId}`);
    // This should never be null
    return threadRedirectMethod.current?.get(threadId) || (() => {});
  };

  const showEmptyMessage = boardActivityData?.[0]?.activity?.length === 0;

  return (
    <div className="main">
      {isLoggedIn && (
        <PostEditorModal
          isOpen={postEditorOpen}
          secretIdentity={{
            name: "[TBD]",
            avatar: `/tuxedo-mask.jpg`,
          }}
          userIdentity={{
            name: user?.username,
            avatar: user?.avatarUrl,
          }}
          onPostSaved={(post: any) => {
            queryCache.refetchQueries(["boardActivityData", { slug }]);
            setPostEditorOpen(false);
          }}
          onCloseModal={() => setPostEditorOpen(false)}
          submitUrl={`/threads/${slug}/create`}
          uploadBaseUrl={`images/${slug}/`}
        />
      )}
      <Layout
        mainContent={
          <FeedWithMenu
            showSidebar={showSidebar}
            sidebarContent={
              <>
                <BoardSidebar
                  board={{
                    slug: slug,
                    avatar: boardData?.avatarUrl || "/",
                    description: boardData?.tagline || "loading...",
                    color: boardData?.accentColor || "#f96680",
                  }}
                />
                <img
                  className="under-construction"
                  src="/under_construction_icon.png"
                />
              </>
            }
            feedContent={
              <div className="main">
                {showEmptyMessage && (
                  <img className="empty" src={"/nothing.jpg"} />
                )}
                {boardActivityData &&
                  boardActivityData
                    .reduce((agg, val: any) => agg.concat(val.activity), [])
                    .map((post: PostType) => {
                      const hasReplies =
                        post.postsAmount > 1 || post.commentsAmount > 0;
                      const threadUrl = `/${router.query.boardId}/thread/${post.threadId}`;
                      return (
                        <div className="post" key={`${post.postId}_container`}>
                          <Post
                            key={post.postId}
                            createdTime={`${moment
                              .utc(post.created)
                              .fromNow()}${
                              hasReplies
                                ? ` [updated: ${moment
                                    .utc(post.lastActivity)
                                    .fromNow()}]`
                                : ""
                            }`}
                            text={post.content}
                            tags={post.tags}
                            secretIdentity={post.secretIdentity}
                            userIdentity={post.userIdentity}
                            onNewContribution={getMemoizedRedirectMethod(
                              post.threadId
                            )}
                            onNewComment={getMemoizedRedirectMethod(
                              post.threadId
                            )}
                            size={
                              post?.options?.wide
                                ? PostSizes.WIDE
                                : PostSizes.REGULAR
                            }
                            newPost={isLoggedIn && post.isNew}
                            newComments={isLoggedIn && post.newCommentsAmount}
                            newContributions={
                              isLoggedIn &&
                              post.newPostsAmount - (post.isNew ? 1 : 0)
                            }
                            totalComments={post.commentsAmount}
                            // subtract 1 since posts_amount is the amount of posts total in the thread
                            // including the head one.-
                            totalContributions={post.postsAmount - 1}
                            directContributions={post.threadsAmount}
                            onNotesClick={getMemoizedRedirectMethod(
                              post.threadId
                            )}
                            notesUrl={threadUrl}
                            // menuOptions={[
                            //   {
                            //     name: "Copy Link",
                            //     onClick: () => {
                            //       const tempInput = document.createElement(
                            //         "input"
                            //       );
                            //       tempInput.value = new URL(
                            //         threadUrl,
                            //         window.location.origin
                            //       ).toString();
                            //       document.body.appendChild(tempInput);
                            //       tempInput.select();
                            //       document.execCommand("copy");
                            //       document.body.removeChild(tempInput);
                            //       toast.success("Link copied!");
                            //     },
                            //   },
                            //   // Add options just for logged in users
                            //   ...(isLoggedIn
                            //     ? [
                            //         {
                            //           name: "Mark Visited",
                            //           onClick: () => {
                            //             readThread(post.thread_id);
                            //           },
                            //         },
                            //       ]
                            //     : []),
                            // ]}
                          />
                        </div>
                      );
                    })}
                <div className="loading">
                  {!showEmptyMessage &&
                    boardActivityData?.length > 0 &&
                    (isFetchingMore
                      ? "Loading more..."
                      : canFetchMore
                      ? "..."
                      : "Nothing more to load")}
                </div>
              </div>
            }
            onReachEnd={() => {
              info(`Attempting to fetch more...`);
              if (canFetchMore) {
                info(`...found stuff!`);
                fetchMore();
                return;
              }
              info(`...but there's nothing!`);
            }}
          />
        }
        actionButton={
          isLoggedIn && (
            <PostingActionButton
              accentColor={boardData?.accentColor || "#f96680"}
              onNewPost={() => setPostEditorOpen(true)}
            />
          )
        }
        title={`!${slug}`}
        onTitleClick={() => setShowSidebar(!showSidebar)}
        forceHideTitle={true}
        loading={isFetchingBoardActivity}
      />
      <style jsx>{`
        .main {
          width: 100%;
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
          margin-top: -20px;
          opacity: 0.5;
          filter: grayscale(0.4);
        }
      `}</style>
    </div>
  );
}

export default BoardPage;
