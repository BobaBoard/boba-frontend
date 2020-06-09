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

const Layout = (props: LayoutProps) => {
  const router = useRouter();
  const { isPending: isUserPending, user, isLoggedIn } = useAuth();
  const [loginOpen, setLoginOpen] = React.useState(false);
  const layoutRef = React.useRef();

  const { data: boardData, isFetching: isFetchingBoardData } = useQuery(
    ["boardData", { slug: router.query.boardId?.slice(1) }],
    getBoardData,
    { staleTime: Infinity }
  );
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
        color={boardData?.settings.accentColor || "#f96680"}
      />
      <InnerLayout
        ref={layoutRef}
        mainContent={props.mainContent}
        sideMenuContent={
          <SideMenu
            pinnedBoards={(pinnedBoards || []).map((board: any) => ({
              slug: board.slug,
              avatar: `${board.avatarUrl}`,
              description: board.tagline,
              color: board.settings?.accentColor,
              updates: !!(isLoggedIn && board.has_updates),
              onClick: (slug: string) => {
                router.push(`/[boardId]`, `/!${slug}`);
                // @ts-ignore
                layoutRef.current?.closeSideMenu();
                // TODO: do this on board opening
                setTimeout(() => {
                  refetch({ force: true });
                }, 2000);
              },
            }))}
            searchBoards={undefined}
            recentBoards={undefined}
            showSearch={false}
          />
        }
        actionButton={props.actionButton}
        headerAccent={boardData?.settings.accentColor || "#f96680"}
        onUserBarClick={() => setLoginOpen(true)}
        user={user}
        title={props.title}
        onTitleClick={props.onTitleClick}
        loading={props.loading || isFetchingBoardData || isUserPending}
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
  onTitleClick?: () => void;
}
export default Layout;
