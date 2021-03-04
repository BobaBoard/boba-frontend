import React from "react";
import { SideMenu, Layout as InnerLayout } from "@bobaboard/ui-components";
import LoginModal from "./LoginModal";
import { dismissAllNotifications } from "../utils/queries";
import { useAuth } from "./Auth";
import { NextRouter, useRouter } from "next/router";
import { useMutation, useQueryClient } from "react-query";
import { useBoardContext } from "./BoardContext";
import { processBoardsUpdates } from "../utils/boards-utils";
import { useCachedLinks, FEED_URL } from "./hooks/useCachedLinks";
import debug from "debug";
import {
  faArchive,
  faBook,
  faCommentSlash,
  faCogs,
  faComments,
  faInbox,
  faSignOutAlt,
  faTh,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import Head from "next/head";
import { getTitle } from "pages/_app";

const log = debug("bobafrontend:queries-log");

const getSelectedMenuOptionFromPath = (router: NextRouter) => {
  if (router.asPath == FEED_URL) {
    return "feed";
  }
  return "";
};

interface LayoutComposition {
  MainContent: React.FC<{}>;
  ActionButton: React.FC<{}>;
}

const MainContent: LayoutComposition["MainContent"] = (props) => {
  return <>{props.children}</>;
};

const ActionButton: LayoutComposition["ActionButton"] = (props) => {
  return <>{props.children}</>;
};

const isMainContent = (node: React.ReactNode): node is typeof MainContent => {
  return React.isValidElement(node) && node.type == MainContent;
};
const isActionButton = (node: React.ReactNode): node is typeof ActionButton => {
  return React.isValidElement(node) && node.type == ActionButton;
};

const MAX_UNREAD_BOARDS_DISPLAY = 4;
const Layout: React.FC<LayoutProps> & LayoutComposition = (props) => {
  const router = useRouter();
  const {
    linkToHome,
    linkToFeed,
    getLinkToBoard,
    linkToPersonalSettings,
    linkToLogs,
  } = useCachedLinks();
  const { isPending: isUserPending, user, isLoggedIn } = useAuth();
  const [loginOpen, setLoginOpen] = React.useState(false);
  const layoutRef = React.useRef<{ closeSideMenu: () => void }>(null);
  const slug: string = router.query.boardId?.slice(1) as string;
  const { boardsData, refetch, hasLoggedInData } = useBoardContext();
  const [boardFilter, setBoardFilter] = React.useState("");
  const queryClient = useQueryClient();
  const { mutate: dismissNotifications } = useMutation(
    dismissAllNotifications,
    {
      onSuccess: () => {
        log(`Successfully dismissed all notifications. Refetching...`);
        queryClient.invalidateQueries(["allBoardsData", { isLoggedIn }]);
        if (slug) {
          queryClient.invalidateQueries(["boardActivityData", { slug }]);
        }
        if (router.query.id) {
          queryClient.invalidateQueries([
            "threadData",
            { threadId: router.query.id },
          ]);
        }
      },
    }
  );
  const onBoardChange = React.useCallback(() => {
    layoutRef.current?.closeSideMenu();
    refetch();
  }, [layoutRef.current?.closeSideMenu, refetch]);
  const [isChangingRoute, setChangingRoute] = React.useState(false);

  React.useEffect(() => {
    const changeStartHandler = () => {
      setChangingRoute(true);
    };
    const changeEndHandler = () => {
      setChangingRoute(false);
    };
    router.events.on("routeChangeStart", changeStartHandler);
    router.events.on("beforeHistoryChange", changeStartHandler);
    router.events.on("routeChangeComplete", changeEndHandler);
    return () => {
      router.events.off("routeChangeStart", changeStartHandler);
      router.events.off("beforeHistoryChange", changeStartHandler);
      router.events.off("routeChangeComplete", changeEndHandler);
    };
  }, []);
  const {
    pinnedBoards,
    recentBoards,
    allBoards,
    hasUpdates,
    isOutdated,
  } = React.useMemo(
    () =>
      processBoardsUpdates(
        Object.values(boardsData).reduce((agg, board) => {
          agg[board.slug] = {
            slug: board.slug.replace("_", " "),
            avatar: `${board.avatarUrl}`,
            description: board.tagline,
            color: board.accentColor,
            lastUpdate: isLoggedIn
              ? board.lastUpdateFromOthers
              : board.lastUpdate,
            updates: isLoggedIn && board.hasUpdates,
            outdated:
              board.lastUpdateFromOthers &&
              board.lastVisit &&
              board.lastUpdateFromOthers < board.lastVisit,
            muted: board.muted,
            link: getLinkToBoard(board.slug, onBoardChange),
            pinnedOrder: board.pinnedOrder,
          };
          return agg;
        }, {} as Parameters<typeof processBoardsUpdates>[0]),
        boardFilter,
        isLoggedIn
      ),
    [boardFilter, boardsData, isLoggedIn]
  );

  const boardData = boardsData[slug];
  const mainContent = React.Children.toArray(props.children).find((child) =>
    isMainContent(child)
  ) as typeof MainContent | undefined;
  const actionButton = React.Children.toArray(props.children).find((child) =>
    isActionButton(child)
  ) as typeof ActionButton | undefined;

  return (
    <div>
      <Head>
        <title>{getTitle(boardData)}</title>
      </Head>
      {loginOpen && (
        <LoginModal
          isOpen={loginOpen}
          onCloseModal={() => setLoginOpen(false)}
          color={boardData?.accentColor || "#f96680"}
        />
      )}
      <InnerLayout
        ref={layoutRef}
        mainContent={mainContent}
        sideMenuContent={
          <SideMenu
            pinnedBoards={pinnedBoards}
            menuOptions={React.useMemo(
              () =>
                isLoggedIn
                  ? [
                      {
                        icon: faCommentSlash,
                        name: "Dismiss notifications",
                        link: { onClick: dismissNotifications },
                      },
                    ]
                  : [],
              [isLoggedIn, dismissNotifications]
            )}
            showPinned={isUserPending || isLoggedIn}
            onFilterChange={setBoardFilter}
            currentBoardSlug={slug}
          >
            <>
              {(isUserPending || isLoggedIn) && (
                <SideMenu.BoardsMenuSection
                  key="recent-unreads"
                  title={
                    // TODO: this board is hidden cause the last update data
                    // comes from the cache for logged out users, which
                    // means we can't show them in order of update
                    isUserPending || isLoggedIn
                      ? "recent unreads"
                      : "recent updates"
                  }
                  icon={faClock}
                  boards={recentBoards.filter(
                    (board, index) => index < MAX_UNREAD_BOARDS_DISPLAY
                  )}
                  emptyTitle="Congratulations!"
                  emptyDescription="You read 'em all."
                  placeholdersHeight={
                    isUserPending || !hasLoggedInData
                      ? MAX_UNREAD_BOARDS_DISPLAY
                      : 0
                  }
                  accentColor={boardData?.accentColor || "#f96680"}
                  loading={isUserPending || (isLoggedIn && !hasLoggedInData)}
                />
              )}
              <SideMenu.BoardsMenuSection
                key="all-boards"
                title="all boards"
                icon={faTh}
                boards={allBoards}
                emptyTitle="There's no board here."
                emptyDescription="Somehow, that feels wrong."
              />
            </>
          </SideMenu>
        }
        actionButton={actionButton}
        headerAccent={boardData?.accentColor || "#f96680"}
        onUserBarClick={React.useCallback(
          () => setLoginOpen(!isUserPending && !isLoggedIn),
          [isUserPending, isLoggedIn]
        )}
        loggedInMenuOptions={React.useMemo(
          () => [
            {
              icon: faArchive,
              name: "Logs Archive",
              link: linkToLogs,
            },
            {
              icon: faCogs,
              name: "User Settings",
              link: linkToPersonalSettings,
            },
            {
              icon: faBook,
              name: "Welcome Guide",
              link: {
                href:
                  "https://www.notion.so/BobaBoard-s-Welcome-Packet-b0641466bfdf4a1cab8575083459d6a2",
              },
            },
            {
              icon: faComments,
              name: "Leave Feedback!",
              link: {
                href:
                  "https://docs.google.com/forms/d/e/1FAIpQLSfyMENg9eDNmRj-jIvIG5_ElJFwpGZ_VPvzAskarqu5kf0MSA/viewform",
              },
            },
            {
              icon: faSignOutAlt,
              name: "Logout",
              link: { onClick: () => setLoginOpen(true) },
            },
          ],
          [isLoggedIn]
        )}
        user={user}
        title={props.title}
        forceHideTitle={props.forceHideTitle}
        loading={props.loading || isUserPending || isChangingRoute}
        userLoading={isUserPending}
        updates={isLoggedIn && hasUpdates}
        outdated={isOutdated}
        onSideMenuButtonClick={refetch}
        logoLink={linkToHome}
        menuOptions={React.useMemo(
          () =>
            isLoggedIn
              ? [
                  {
                    id: "feed",
                    icon: faInbox,
                    link: linkToFeed,
                  },
                ]
              : [],
          [isLoggedIn]
        )}
        selectedMenuOption={getSelectedMenuOptionFromPath(router)}
        // TODO: add feed here
        titleLink={
          props.onTitleClick
            ? React.useMemo(
                () => ({
                  href: slug ? getLinkToBoard(slug).href : "/",
                  onClick: props.onTitleClick,
                }),
                [slug, props.onTitleClick]
              )
            : slug
            ? getLinkToBoard(slug)
            : linkToHome
        }
        onCompassClick={props.onCompassClick}
      />
    </div>
  );
};

export interface LayoutProps {
  loading?: boolean;
  title: string;
  forceHideTitle?: boolean;
  onTitleClick?: () => void;
  onCompassClick?: () => void;
}

Layout.ActionButton = ActionButton;
Layout.MainContent = MainContent;
export default Layout;
