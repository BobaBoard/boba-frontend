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
import { goToThread } from "../../utils/location";
import axios from "axios";
import debug from "debug";
import moment from "moment";

const log = debug("bobafrontend:boardPage-log");

function BoardPage() {
  const [postEditorOpen, setPostEditorOpen] = React.useState(false);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const router = useRouter();
  const slug: string = router.query.boardId?.slice(1) as string;
  const { isPending, isLoggedIn, user } = useAuth();
  const { [slug]: boardData } = useBoardTheme();
  // Create an object to memoize all the functions to go to a different thread so
  // we don't trigger unnecessary rerenders
  const goToThreadMemo = React.useRef<Map<string, () => void>>(new Map());

  const {
    data: boardActivityData,
    isFetching: isFetchingBoardActivity,
    isFetchingMore,
    fetchMore,
    canFetchMore,
  } = useInfiniteQuery(["boardActivityData", { slug }], getBoardActivityData, {
    getFetchMore: (lastGroup, allGroups) => {
      log(`Fetched next threads page`);
      log(lastGroup);
      return lastGroup.next_page_cursor;
    },
  });

  // @ts-ignore
  const [readThread] = useMutation(
    (threadId: string) => markThreadAsRead({ threadId }),
    {
      onMutate: (threadId) => {
        log(`Optimistically marking thread ${threadId} as visited.`);
        const boardActivityData = queryCache.getQueryData([
          "boardActivityData",
          { slug },
        ]) as Array<any>;
        const updatedPost = boardActivityData
          .flatMap((data: any) => data.activity)
          .find((post) => post.thread_id == threadId);
        log(updatedPost);
        updatedPost.is_new = false;
        updatedPost.new_comments_amount = 0;
        updatedPost.new_posts_amount = 0;
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
                    .map((post: any) => {
                      const hasReplies =
                        post.posts_amount > 1 || post.comments_amount > 0;
                      const threadUrl = `/${router.query.boardId}/thread/${post.thread_id}`;
                      if (!goToThreadMemo.current.has(post.thread_id)) {
                        goToThreadMemo.current.set(post.thread_id, () =>
                          goToThread(
                            router.query.boardId as string,
                            post.thread_id
                          )
                        );
                      }
                      return (
                        <div className="post" key={`${post.post_id}_container`}>
                          <Post
                            key={post.post_id}
                            createdTime={`${moment
                              .utc(post.created)
                              .fromNow()}${
                              hasReplies
                                ? ` [updated: ${moment
                                    .utc(post.last_activity)
                                    .fromNow()}]`
                                : ""
                            }`}
                            text={post.content}
                            tags={{
                              whisperTags: post.whisper_tags,
                            }}
                            secretIdentity={{
                              name: post.secret_identity.name,
                              avatar: post.secret_identity.avatar,
                            }}
                            userIdentity={{
                              name: post.user_identity?.name,
                              avatar: post.user_identity?.avatar,
                            }}
                            onNewContribution={
                              goToThreadMemo.current.get(
                                post.thread_id
                              ) as () => void
                            }
                            onNewComment={
                              goToThreadMemo.current.get(
                                post.thread_id
                              ) as () => void
                            }
                            size={
                              post?.options?.wide
                                ? PostSizes.WIDE
                                : PostSizes.REGULAR
                            }
                            newPost={isLoggedIn && post.is_new}
                            newComments={isLoggedIn && post.new_comments_amount}
                            newContributions={
                              isLoggedIn &&
                              post.new_posts_amount - (post.is_new ? 1 : 0)
                            }
                            totalComments={post.comments_amount}
                            // subtract 1 since posts_amount is the amount of posts total in the thread
                            // including the head one.-
                            totalContributions={post.posts_amount - 1}
                            directContributions={post.threads_amount}
                            onNotesClick={
                              goToThreadMemo.current.get(
                                post.thread_id
                              ) as () => void
                            }
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
              if (canFetchMore) {
                fetchMore();
              }
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
