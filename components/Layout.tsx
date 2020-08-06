import React from "react";
import {
  SideMenu,
  Layout as InnerLayout,
  // @ts-ignore
} from "@bobaboard/ui-components";
import LoginModal from "./LoginModal";
import {
  getAllBoardsData,
  dismissAllNotifications,
  ALL_BOARDS_KEY,
} from "./../utils/queries";
import { useAuth } from "./Auth";
import { useRouter } from "next/router";
import { useQuery, useMutation, queryCache } from "react-query";
// @ts-ignore
import { ReactQueryDevtools } from "react-query-devtools";
import { useBoardTheme } from "./BoardTheme";
import debug from "debug";

const log = debug("bobafrontend:queries-log");

const Layout = (props: LayoutProps) => {
  const router = useRouter();
  const { isPending: isUserPending, user, isLoggedIn } = useAuth();
  const [loginOpen, setLoginOpen] = React.useState(false);
  const layoutRef = React.useRef<{ closeSideMenu: () => void }>(null);
  const slug: string = router.query.boardId?.slice(1) as string;
  const { [slug]: boardData, fetching } = useBoardTheme();
  const { data: pinnedBoards, refetch } = useQuery(
    "allBoardsData",
    // TODO: fix this typing
    // @ts-ignore
    getAllBoardsData,
    {
      initialData: () => {
        if (typeof localStorage === "undefined") {
          return undefined;
        }
        // Localstorage is a client-only feature
        const data = localStorage.getItem(ALL_BOARDS_KEY);
        log(`Loaded boards data from localstorage: ${data}`);
        if (!data) {
          return undefined;
        }
        const boardData = JSON.parse(data);
        boardData.forEach((board: any) => (board.has_updates = false));
        return boardData;
      },
      initialStale: true,
      refetchInterval: 1000 * 60 * 1, // Refetch automatically every minute
      refetchOnWindowFocus: true,
    }
  );
  const [dismissNotifications] = useMutation(dismissAllNotifications, {
    onSuccess: () => {
      log(`Successfully dismissed all notifications. Refetching...`);
      queryCache.invalidateQueries("allBoardsData");
      if (slug) {
        queryCache.invalidateQueries(["boardActivityData", { slug }]);
      }
      if (router.query.id) {
        queryCache.invalidateQueries([
          "threadData",
          { threadId: router.query.id },
        ]);
      }
    },
  });

  const hasUpdates = React.useMemo(
    () =>
      (pinnedBoards || []).reduce(
        (current: boolean, board: any) => current || board.has_updates,
        false
      ),
    [pinnedBoards]
  );
  const goToBoard = React.useCallback((slug: string) => {
    router
      .push(`/[boardId]`, `/!${slug.replace(" ", "_")}`, {
        shallow: true,
      })
      .then(() => {
        window.scrollTo(0, 0);
        refetch();
      });
    // @ts-ignore
    layoutRef.current?.closeSideMenu();
  }, []);
  const pinnedBoardsData = React.useMemo(() => {
    return (pinnedBoards || []).map((board: any) => ({
      slug: board.slug.replace("_", " "),
      avatar: `${board.avatarUrl}`,
      description: board.tagline,
      color: board.settings?.accentColor,
      updates: !!(isLoggedIn && board.has_updates),
      onClick: goToBoard,
      href: `/!${board.slug.replace(" ", "_")}`,
    }));
  }, [pinnedBoards]);

  return (
    <div>
      {loginOpen && (
        <LoginModal
          isOpen={loginOpen}
          onCloseModal={() => setLoginOpen(false)}
          color={boardData?.accentColor || "#f96680"}
        />
      )}
      <InnerLayout
        ref={layoutRef}
        mainContent={props.mainContent}
        sideMenuContent={
          <SideMenu
            pinnedBoards={pinnedBoardsData}
            showSearch={false}
            showDismissNotifications={isLoggedIn}
            onNotificationsDismissRequest={dismissNotifications}
          />
        }
        actionButton={props.actionButton}
        headerAccent={boardData?.accentColor || "#f96680"}
        onUserBarClick={() => setLoginOpen(!isUserPending && !isLoggedIn)}
        loggedInMenuOptions={
          isLoggedIn && [
            {
              name: "Logs Archive",
              onClick: () => {
                router.push("/update-logs").then(() => window.scrollTo(0, 0));
              },
            },
            { name: "Logout", onClick: () => setLoginOpen(true) },
          ]
        }
        user={user}
        title={props.title}
        onTitleClick={props.onTitleClick}
        forceHideTitle={props.forceHideTitle}
        loading={props.loading || fetching || isUserPending}
        onLogoClick={() => router.push("/").then(() => window.scrollTo(0, 0))}
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
