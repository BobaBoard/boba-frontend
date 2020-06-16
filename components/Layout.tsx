import React from "react";
import {
  SideMenu,
  Layout as InnerLayout,
  // @ts-ignore
} from "@bobaboard/ui-components";
import LoginModal from "./LoginModal";
import { getBoardData, getAllBoardsData } from "./../utils/queries";
import { useAuth } from "./Auth";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
// @ts-ignore
import { ReactQueryDevtools } from "react-query-devtools";
import { useBoardTheme } from "./BoardTheme";

const Layout = (props: LayoutProps) => {
  const router = useRouter();
  const { isPending: isUserPending, user, isLoggedIn } = useAuth();
  const [loginOpen, setLoginOpen] = React.useState(false);
  const layoutRef = React.useRef<{ closeSideMenu: () => void }>(null);
  const slug: string = router.query.boardId?.slice(1) as string;
  const { [slug]: boardData, fetching } = useBoardTheme();

  const { data: pinnedBoards, refetch } = useQuery(
    "allBoardsData",
    getAllBoardsData
  );

  const hasUpdates = (pinnedBoards || []).reduce(
    (current: boolean, board: any) => current || board.has_updates,
    false
  );
  return (
    <div>
      <LoginModal
        isOpen={loginOpen}
        onCloseModal={() => setLoginOpen(false)}
        color={boardData?.accentColor || "#f96680"}
      />
      <InnerLayout
        ref={layoutRef}
        mainContent={props.mainContent}
        sideMenuContent={
          <>
            <SideMenu
              pinnedBoards={(pinnedBoards || []).map((board: any) => ({
                slug: board.slug.replace("_", " "),
                avatar: `${board.avatarUrl}`,
                description: board.tagline,
                color: board.settings?.accentColor,
                updates: !!(isLoggedIn && board.has_updates),
                onClick: (slug: string) => {
                  router.push(`/[boardId]`, `/!${slug.replace(" ", "_")}`);
                  // @ts-ignore
                  layoutRef.current?.closeSideMenu();
                  // TODO: do this on board opening
                  setTimeout(() => {
                    refetch({ force: true });
                  }, 2000);
                },
              }))}
              showSearch={false}
            />
          </>
        }
        actionButton={props.actionButton}
        headerAccent={boardData?.accentColor || "#f96680"}
        onUserBarClick={() => setLoginOpen(true)}
        user={user}
        title={props.title}
        onTitleClick={props.onTitleClick}
        forceHideTitle={props.forceHideTitle}
        loading={props.loading || fetching || isUserPending}
        onLogoClick={() => router.push("/")}
        updates={isLoggedIn && hasUpdates}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
};

export interface LayoutProps {
  mainContent: JSX.Element;
  actionButton?: JSX.Element;
  loading?: boolean;
  title: string;
  forceHideTitle?: boolean;
  onTitleClick?: () => void;
}
export default Layout;
