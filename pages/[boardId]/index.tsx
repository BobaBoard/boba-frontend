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
import axios from "axios";
import { useQuery } from "react-query";
import { toast, Zoom } from "react-toastify";
import { useAuth } from "../../components/Auth";
import LoginModal from "../../components/LoginModal";
import SideMenu from "../../components/SideMenu";

// @ts-ignore
import { ReactQueryDevtools } from "react-query-devtools";
import { useRouter } from "next/router";

const getBoardData = async (key: string, { slug }: { slug: string }) => {
  const response = await axios.get(`boards/${slug}`);
  return response.data;
};
const getBoardActivityData = async (
  key: string,
  { slug }: { slug: string }
) => {
  const response = await axios.get(`boards/${slug}/activity/latest`);
  return response.data;
};

function HomePage() {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [postEditorOpen, setPostEditorOpen] = React.useState(false);
  const router = useRouter();
  const { isPending, isLoggedIn, user } = useAuth();
  const [loginOpen, setLoginOpen] = React.useState(false);

  const {
    data: boardData,
    isFetching: isFetchingBoardData,
    error: boardDataError,
  } = useQuery(
    ["boardData", { slug: router.query.boardId?.slice(1) }],
    getBoardData
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

  return (
    <div className="main">
      <LoginModal
        isOpen={loginOpen}
        onCloseModal={() => setLoginOpen(false)}
        color={
          isFetchingBoardData ? "#f96680" : boardData?.settings?.accentColor
        }
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
          setPostEditorOpen(false);
        }}
        onCloseModal={() => setPostEditorOpen(false)}
        submitUrl={`/threads/${router.query.boardId?.slice(1)}/create`}
      />
      <Layout
        mainContent={
          <FeedWithMenu
            sidebarContent={
              <BoardSidebar
                board={{
                  slug: isFetchingBoardData ? "loading..." : boardData?.slug,
                  avatar: isFetchingBoardData ? "/" : boardData?.avatarUrl,
                  description: isFetchingBoardData
                    ? "loading..."
                    : boardData?.tagline,
                  color: isFetchingBoardData
                    ? "#f96680"
                    : boardData?.settings.accentColor,
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
                {isFetchingBoardActivity && <div>Loading</div>}
                {boardActivityData &&
                  boardActivityData.map((post: any) => {
                    return (
                      <div className="post">
                        <Post
                          key={post.post_id}
                          createdTime={"at some point"}
                          text={post.content}
                          secretIdentity={{
                            name: post.secret_identity.name,
                            avatar: post.secret_identity.avatar,
                          }}
                          userIdentity={{
                            name: post.user_identity?.username,
                            avatar: post.user_identity?.avatar,
                          }}
                          onOpenComments={() =>
                            router.push(
                              `/[boardId]/thread/[id]/`,
                              `/${router.query.boardId}/thread/${post.thread_id}/`
                            )
                          }
                          onOpenContributions={() =>
                            router.push(
                              `/[boardId]/thread/[id]/`,
                              `/${router.query.boardId}/thread/${post.thread_id}/`
                            )
                          }
                          onNewContribution={() =>
                            router.push(
                              `/[boardId]/thread/[id]/`,
                              `/${router.query.boardId}/thread/${post.thread_id}/`
                            )
                          }
                          onNewComment={() =>
                            router.push(
                              `/[boardId]/thread/[id]/`,
                              `/${router.query.boardId}/thread/${post.thread_id}/`
                            )
                          }
                          size={
                            post.options?.wide
                              ? PostSizes.WIDE
                              : PostSizes.REGULAR
                          }
                          newPost={post.newPost}
                          newComments={post.newComments}
                          newContributions={post.newContributions}
                          totalComments={post.comments_amount}
                          totalContributions={post.posts_amount}
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
              accentColor={
                isFetchingBoardData
                  ? "#f96680"
                  : boardData?.settings.accentColor
              }
              onNewPost={() => setPostEditorOpen(true)}
            />
          )
        }
        headerAccent={
          isFetchingBoardData ? "#f96680" : boardData?.settings.accentColor
        }
        title={`!${isFetchingBoardData ? "loading..." : boardData?.slug}`}
        onTitleClick={() => {
          setShowSidebar(!showSidebar);
        }}
        onUserBarClick={() => setLoginOpen(true)}
        user={user}
        loading={isPending}
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
      `}</style>
    </div>
  );
}

export default HomePage;
