import React from "react";
import {
  Layout,
  Post,
  PostSizes,
  FeedWithMenu,
  BoardSidebar,
  PostingActionButton,
  // @ts-ignore
} from "@bobaboard/ui-components";
import PostEditorModal from "../../components/PostEditorModal";
import { useQuery, queryCache } from "react-query";
import { toast, Zoom } from "react-toastify";
import { useAuth } from "../../components/Auth";
import LoginModal from "../../components/LoginModal";
import SideMenu from "../../components/SideMenu";
import { getBoardActivityData, getBoardData } from "../../utils/queries";
import axios from "axios";

// @ts-ignore
import { ReactQueryDevtools } from "react-query-devtools";
import { useRouter } from "next/router";

import moment from "moment";

function HomePage() {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [postEditorOpen, setPostEditorOpen] = React.useState(false);
  const router = useRouter();
  const { isPending, isLoggedIn, user } = useAuth();
  const [loginOpen, setLoginOpen] = React.useState(false);

  const { data: boardData, error: boardDataError } = useQuery(
    ["boardData", { slug: router.query.boardId?.slice(1) }],
    getBoardData,
    { staleTime: Infinity }
  );
  const {
    data: boardActivityData,
    isFetching: isFetchingBoardActivity,
    error: boardActivityError,
  } = useQuery(
    ["boardActivityData", { slug: router.query.boardId?.slice(1) }],
    getBoardActivityData
  );

  React.useEffect(() => {
    if (boardDataError || boardActivityError) {
      const errorMessage =
        boardDataError?.message || boardActivityError?.message;
      toast.error(errorMessage, {
        position: "top-center",
        transition: Zoom,
        toastId: errorMessage,
        hideProgressBar: true,
      });
    }
  }, [boardDataError, boardActivityError]);

  React.useEffect(() => {
    console.log(`board_id:`, router.query.boardId?.slice(1));
    if (!isPending && isLoggedIn) {
      axios.get(`boards/${router.query.boardId?.slice(1)}/visit`);
    }
  }, [isPending, isLoggedIn, router.query.boardId]);

  const showEmptyMessage = boardActivityData?.length === 0;

  const slug: string = router.query.boardId?.slice(1) as string;
  return (
    <div className="main">
      <LoginModal
        isOpen={loginOpen}
        onCloseModal={() => setLoginOpen(false)}
        color={boardData?.settings.accentColor || "#f96680"}
      />
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
      <Layout
        mainContent={
          <FeedWithMenu
            sidebarContent={
              <BoardSidebar
                board={{
                  slug: slug,
                  avatar: boardData?.avatarUrl || "/",
                  description: boardData?.tagline || "loading...",
                  color: boardData?.settings.accentColor || "#f96680",
                  boardWideTags: [
                    { name: "gore", color: "#f96680" },
                    { name: "guro", color: "#e22b4b" },
                    { name: "nsfw", color: "#27caba" },
                    { name: "dead dove", color: "#f9e066" },
                  ],
                  canonicalTags: [
                    { name: "request", color: "#27caba" },
                    { name: "blood", color: "#f96680" },
                    { name: "knifeplay", color: "#93b3b0" },
                    { name: "aesthetic", color: "#24d282" },
                    { name: "impalement", color: "#27caba" },
                    { name: "skullfuck", color: "#e22b4b" },
                    { name: "hanging", color: "#f9e066" },
                    { name: "torture", color: "#f96680" },
                    { name: "necrophilia", color: "#93b3b0" },
                    { name: "shota", color: "#e22b4b" },
                    { name: "fanfiction", color: "#27caba" },
                    { name: "rec", color: "#f9e066" },
                    { name: "doujinshi", color: "#f96680" },
                    { name: "untagged", color: "#93b3b0" },
                  ],
                  contentRulesTags: [
                    { name: "shota", allowed: true },
                    { name: "nsfw", allowed: true },
                    { name: "noncon", allowed: true },
                    { name: "IRL", allowed: false },
                    { name: "RP", allowed: false },
                  ],
                  otherRules: (
                    <div>
                      <ul>
                        <li>
                          Shota <strong>must</strong> be tagged.
                        </li>
                        <li>
                          Requests go in the appropriate tag. If the same
                          request has been made less than a month ago, it will
                          be deleted by the mods.
                        </li>
                        <li>
                          Mods might add any TWs tag as they see fit. If you
                          need help, add #untagged and a mod will take care of
                          it.
                        </li>
                      </ul>
                    </div>
                  ),
                }}
              />
            }
            feedContent={
              <div className="main">
                {showEmptyMessage && (
                  <img className="empty" src={"/nothing.jpg"} />
                )}
                {boardActivityData &&
                  boardActivityData.map((post: any) => {
                    const hasReplies =
                      post.posts_amount > 1 || post.comments_amount > 0;
                    return (
                      <div className="post">
                        <Post
                          key={post.post_id}
                          createdTime={`${moment.utc(post.created).fromNow()}${
                            hasReplies
                              ? ` [updated: ${moment
                                  .utc(post.last_activity)
                                  .fromNow()}]`
                              : ""
                          }`}
                          text={post.content}
                          secretIdentity={{
                            name: post.secret_identity.name,
                            avatar: post.secret_identity.avatar,
                          }}
                          userIdentity={{
                            name: post.user_identity?.name,
                            avatar: post.user_identity?.avatar,
                          }}
                          onOpenComments={() =>
                            router.push(
                              `/[boardId]/thread/[id]`,
                              `/${router.query.boardId}/thread/${post.thread_id}`
                            )
                          }
                          onOpenContributions={() =>
                            router.push(
                              `/[boardId]/thread/[id]`,
                              `/${router.query.boardId}/thread/${post.thread_id}`
                            )
                          }
                          onNewContribution={() =>
                            router.push(
                              `/[boardId]/thread/[id]`,
                              `/${router.query.boardId}/thread/${post.thread_id}`
                            )
                          }
                          onNewComment={() =>
                            router.push(
                              `/[boardId]/thread/[id]`,
                              `/${router.query.boardId}/thread/${post.thread_id}`
                            )
                          }
                          size={
                            post.options?.wide
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
                          // including the head one.
                          totalContributions={post.posts_amount - 1}
                          directContributions={post.threads_amount}
                        />
                      </div>
                    );
                  })}
              </div>
            }
          />
        }
        sideMenuContent={<SideMenu />}
        actionButton={
          isLoggedIn && (
            <PostingActionButton
              accentColor={boardData?.settings.accentColor || "#f96680"}
              onNewPost={() => setPostEditorOpen(true)}
            />
          )
        }
        headerAccent={boardData?.settings.accentColor || "#f96680"}
        title={`!${slug}`}
        onTitleClick={() => {
          setShowSidebar(!showSidebar);
        }}
        onUserBarClick={() => setLoginOpen(true)}
        user={user}
        loading={isFetchingBoardActivity}
      />
      <ReactQueryDevtools initialIsOpen={false} />
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
      `}</style>
    </div>
  );
}

export default HomePage;
