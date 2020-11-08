import React from "react";
import { SideMenu, Layout as InnerLayout } from "@bobaboard/ui-components";
import LoginModal from "./LoginModal";
import { dismissAllNotifications } from "../utils/queries";
import { BOARD_URL_PATTERN, createLinkTo } from "./../utils/link-utils";
import { useAuth } from "./Auth";
import { NextRouter, useRouter } from "next/router";
import { useMutation, queryCache } from "react-query";
// @ts-ignore
import { ReactQueryDevtools } from "react-query-devtools";
import { useBoardContext } from "./BoardContext";
import { processBoardsUpdates } from "../utils/boards-utils";
import debug from "debug";
import {
  faArchive,
  faBook,
  faCommentSlash,
  faCogs,
  faComments,
  faInbox,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

const log = debug("bobafrontend:queries-log");

const FEED_URL = "/users/feed";

const getSelectedMenuOptionFromPath = (router: NextRouter) => {
  if (router.asPath == FEED_URL) {
    return "feed";
  }
  return "";
};

const Layout = (props: LayoutProps) => {
  const router = useRouter();
  const { isPending: isUserPending, user, isLoggedIn } = useAuth();
  const [loginOpen, setLoginOpen] = React.useState(false);
  const layoutRef = React.useRef<{ closeSideMenu: () => void }>(null);
  const slug: string = router.query.boardId?.slice(1) as string;
  const { boardsData, refetch } = useBoardContext();
  const [boardFilter, setBoardFilter] = React.useState("");
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

  const goToBoard = React.useCallback(
    (slug: string) =>
      createLinkTo({
        urlPattern: BOARD_URL_PATTERN,
        url: `/!${slug.replace(" ", "_")}`,
        onLoad: () => {
          layoutRef.current?.closeSideMenu();
          refetch();
        },
      }),
    []
  );
  const { pinnedBoards, recentBoards, allBoards, hasUpdates } = React.useMemo(
    () =>
      processBoardsUpdates(
        Object.values(boardsData).reduce((agg, board) => {
          agg[board.slug] = {
            slug: board.slug.replace("_", " "),
            avatar: `${board.avatarUrl}`,
            description: board.tagline,
            color: board.accentColor,
            lastUpdate: board.lastUpdate,
            updates: !!(isLoggedIn && board.hasUpdates),
            muted: board.muted,
            link: goToBoard(board.slug),
            pinnedOrder: board.pinnedOrder,
          };
          return agg;
        }, {} as Parameters<typeof processBoardsUpdates>[0]),
        boardFilter
      ),
    [boardFilter, boardsData]
  );

  const boardData = boardsData[slug];
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
            pinnedBoards={pinnedBoards}
            recentBoards={
              React.useMemo(
                () =>
                  // @ts-ignore
                  recentBoards.filter((board, index) => index < 4),
                [recentBoards]
              ) as any[]
            }
            allBoards={allBoards}
            menuOptions={
              isLoggedIn
                ? [
                    {
                      icon: faCommentSlash,
                      name: "Dismiss Notifications",
                      link: { onClick: dismissNotifications },
                    },
                  ]
                : []
            }
            showRecent={isLoggedIn}
            showPinned={isLoggedIn}
            onFilterChange={setBoardFilter}
          />
        }
        actionButton={props.actionButton}
        headerAccent={boardData?.accentColor || "#f96680"}
        onUserBarClick={() => setLoginOpen(!isUserPending && !isLoggedIn)}
        loggedInMenuOptions={
          isLoggedIn && [
            {
              icon: faArchive,
              name: "Logs Archive",
              link: createLinkTo({ url: "/update-logs" }),
            },
            {
              icon: faCogs,
              name: "User Settings",
              link: createLinkTo({ url: "/users/me" }),
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
          ]
        }
        user={user}
        title={props.title}
        forceHideTitle={props.forceHideTitle}
        loading={props.loading || isUserPending}
        updates={isLoggedIn && hasUpdates}
        onSideMenuButtonClick={refetch}
        logoLink={createLinkTo({ url: "/" })}
        // TODO: figure out why this has a type error
        // @ts-ignore
        menuOptions={
          isLoggedIn
            ? [
                {
                  id: "feed",
                  // TODO: figure out why this has a type error
                  // @ts-ignore
                  icon: faInbox,
                  link: createLinkTo({ url: FEED_URL }),
                },
              ]
            : []
        }
        selectedMenuOption={getSelectedMenuOptionFromPath(router)}
        // TODO: add feed here
        titleLink={
          props.onTitleClick
            ? {
                href: slug ? goToBoard(slug).href : "/",
                onClick: props.onTitleClick,
              }
            : slug
            ? goToBoard(slug)
            : createLinkTo({ url: "/" })
        }
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
