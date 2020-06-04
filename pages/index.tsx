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
import PostEditorModal from "../components/PostEditorModal";
import SideMenu from "../components/SideMenu";
import LoginModal from "../components/LoginModal";
import axios from "axios";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
// @ts-ignore
import { ReactQueryDevtools } from "react-query-devtools";

let NEXT_ID = 0;
const getNextId = () => {
  return NEXT_ID++;
};

const getBoardData = async () => {
  const response = await axios.get("http://localhost:4200/boards/gore");
  return response.data;
};

function HomePage() {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [postEditorOpen, setPostEditorOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const { status, data, isFetching, error } = useQuery(
    "boardData",
    getBoardData
  );
  const router = useRouter();

  return (
    <div className="main">
      <PostEditorModal
        isOpen={postEditorOpen}
        secretIdentity={{
          name: "Tuxedo Mask",
          avatar: `/tuxedo-mask.jpg`,
        }}
        userIdentity={{
          name: "SexyDaddy69",
          avatar: `/mamoru.png`,
        }}
        onPostSaved={(post: any) => {
          setPostEditorOpen(false);
        }}
        onCloseModal={() => setPostEditorOpen(false)}
        submitUrl={`threads/${router.pathname}/create`}
      />
      <LoginModal
        isOpen={loginOpen}
        onCloseModal={() => setLoginOpen(false)}
        color={status === "loading" ? "#f96680" : data.settings.accentColor}
      />
      <Layout
        mainContent={
          <FeedWithMenu
            sidebarContent={
              <BoardSidebar
                board={{
                  slug: status === "loading" ? "loading..." : data.slug,
                  avatar: status === "loading" ? "/" : data.avatarUrl,
                  description:
                    status === "loading" ? "loading..." : data.tagline,
                  color:
                    status === "loading"
                      ? "#f96680"
                      : data.settings.accentColor,
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
                {([] as any[]).map((post, i) => (
                  <div className="post">
                    <Post
                      key={post.id}
                      createdTime={post.createdTime}
                      text={post.text}
                      secretIdentity={post.secretIdentity}
                      userIdentity={post.userIdentity}
                      onNewContribution={() => console.log("click!")}
                      onNewComment={() => console.log("click!")}
                      size={
                        post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR
                      }
                      newPost={post.newPost}
                      newComments={post.newComments}
                      newContributions={post.newContributions}
                      totalComments={post.totalComments}
                      totalContributions={post.totalContributions}
                      directContributions={post.directContributions}
                      collapsed={!!post.newComments && !!post.newContributions}
                    />
                  </div>
                ))}
              </div>
            }
          />
        }
        sideMenuContent={<SideMenu />}
        actionButton={
          <PostingActionButton
            accentColor={
              status === "loading" ? "#f96680" : data.settings.accentColor
            }
            onNewPost={() => setPostEditorOpen(true)}
          />
        }
        headerAccent={
          status === "loading" ? "#f96680" : data.settings.accentColor
        }
        title={`!${status === "loading" ? "loading..." : data.slug}`}
        onTitleClick={() => {
          setShowSidebar(!showSidebar);
        }}
        onUserBarClick={() => setLoginOpen(true)}
      />
      <ReactQueryDevtools initialIsOpen={false} />
      <style jsx>{`
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
