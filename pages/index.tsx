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

const getBoardData = async () => {
  const response = await axios.get("http://localhost:4200/boards/gore");
  return response.data;
};

function HomePage() {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [postEditorOpen, setPostEditorOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  // @ts-ignore
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
          <div className="main">
            <h1>Welcome to BobaBoard!</h1>
            <p>I haven't implemented this main page yet! Woops.</p>
            <p>
              Please open the menu to the side and click on a board to get
              started.
            </p>
            <style jsx>{`
              .main {
                margin: 20px auto;
                width: 100%;
                color: white;
                text-align: center;
              }
            `}</style>
          </div>
        }
        sideMenuContent={<SideMenu />}
        headerAccent={
          status === "loading" ? "#f96680" : data.settings.accentColor
        }
        title={`Hello!`}
        onTitleClick={() => {
          setShowSidebar(!showSidebar);
        }}
        onUserBarClick={() => setLoginOpen(true)}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
}

export default HomePage;
