import React from "react";
import {
  Post,
  PostSizes,
  FeedWithMenu,
  BoardSidebar,
  PostingActionButton,
  toast,
  TagsType,
  TagType,
} from "@bobaboard/ui-components";
import Layout from "../../components/Layout";
import PostEditorModal from "../../components/PostEditorModal";
import { useInfiniteQuery, queryCache, useMutation } from "react-query";
import { useAuth } from "../../components/Auth";
import { useBoardContext } from "../../components/BoardContext";
import {
  getBoardActivityData,
  markThreadAsRead,
  muteThread,
  hideThread,
} from "../../utils/queries";
import {
  updateBoardSettings,
  muteBoard,
  dismissBoardNotifications,
  pinBoard,
} from "../../utils/queries/board";
import {
  removeThreadActivityFromCache,
  setBoardMutedInCache,
  setBoardPinnedInCache,
  setDefaultThreadViewInCache,
  setThreadHiddenInCache,
  setThreadMutedInCache,
} from "../../utils/queries/cache";
import { useRouter } from "next/router";
import axios from "axios";
import debug from "debug";
import moment from "moment";
import {
  BoardData,
  BoardDescription,
  PostType,
  ThreadType,
} from "../../types/Types";
import {
  faBookOpen,
  faCodeBranch,
  faCommentSlash,
  faEdit,
  faEye,
  faEyeSlash,
  faFilm,
  faFilter,
  faImages,
  faLink,
  faThumbtack,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { useCachedLinks } from "../../components/hooks/useCachedLinks";
import noop from "noop-ts";
import { updateThreadView } from "../../utils/queries/post";

const error = debug("bobafrontend:boardPage-error");
const log = debug("bobafrontend:boardPage-log");
const info = debug("bobafrontend:boardPage-info");

function BoardPage() {
  const [postEditorOpen, setPostEditorOpen] = React.useState(false);
  const openPostEditor = React.useCallback(() => setPostEditorOpen(true), []);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const closeSidebar = React.useCallback(() => setShowSidebar(false), []);
  const router = useRouter();
  const slug: string = router.query.boardId?.slice(1) as string;
  const { isPending, isLoggedIn, user } = useAuth();
  const { boardsData, nextPinnedOrder } = useBoardContext();
  const onTitleClick = React.useCallback(() => setShowSidebar(!showSidebar), [
    showSidebar,
  ]);
  const [editingSidebar, setEditingSidebar] = React.useState(false);
  const stopEditing = React.useCallback(() => setEditingSidebar(false), []);
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(
    null
  );

  return (
    <div className="main">
      <Layout
        mainContent={React.useMemo(
          () => (
            <FeedWithMenu
              onCloseSidebar={closeSidebar}
              showSidebar={showSidebar}
              sidebarContent={<div />}
              feedContent={<div />}
            />
          ),
          []
        )}
        actionButton={React.useMemo(
          () => (
            <div />
          ),
          []
        )}
        title={`!${slug}`}
        onTitleClick={onTitleClick}
        forceHideTitle={true}
      />
      <style jsx>{`
        .main {
          width: 100%;
        }
        .post.hidden {
          max-width: 500px;
          width: calc(100% - 40px);
          background-color: gray;
          padding: 20px;
          border: 1px dashed black;
          border-radius: 15px;
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
          opacity: 0.5;
          filter: grayscale(0.4);
        }
      `}</style>
    </div>
  );
}

export default BoardPage;
