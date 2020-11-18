import React from "react";
import {
  SideMenu as InnerSideMenu,
  Layout as InnerLayout,
} from "@bobaboard/ui-components";
import LoginModal from "./LoginModal";
import { dismissAllNotifications } from "../utils/queries";
import { useAuth } from "./Auth";
import { NextRouter, useRouter } from "next/router";
import { useMutation, queryCache } from "react-query";
import { ReactQueryDevtools } from "react-query-devtools";
import useBoardsData from "./hooks/useBoardsData";
import { processBoardsUpdates } from "../utils/boards-utils";
import CachedLinks, { useCachedLinks, FEED_URL } from "./hooks/useCachedLinks";
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
import { usePageDetails } from "utils/router-utils";

const log = debug("bobafrontend:queries-log");

const getSelectedMenuOptionFromPath = (router: NextRouter) => {
  if (router.asPath == FEED_URL) {
    return "feed";
  }
  return "";
};

// TODO: add feed here
const getTitleLinkFromPath = ({
  onTitleClick,
  slug,
}: {
  onTitleClick?: () => void;
  slug: string | null;
}) => {
  return onTitleClick
    ? {
        href: slug ? CachedLinks.getLinkToBoard(slug).href : "/",
        onClick: onTitleClick,
      }
    : slug
    ? CachedLinks.getLinkToBoard(slug).href
    : CachedLinks.linkToHome;
};

// TODO: useCachedLinks is not a hook, and it should be renamed
const getLoginMenuOption = ({ onLogout }: { onLogout: () => void }) => [
  {
    icon: faArchive,
    name: "Logs Archive",
    link: CachedLinks.linkToLogs,
  },
  {
    icon: faCogs,
    name: "User Settings",
    link: CachedLinks.linkToPersonalSettings,
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
    link: { onClick: onLogout },
  },
];

const LOGGED_IN_MENU_BAR_OPTIONS = [
  {
    id: "feed",
    icon: faInbox,
    link: CachedLinks.linkToFeed,
  },
];

const EMPTY_OPTIONS = [] as any[];

const MemoizedInnerSideMenu = React.memo(InnerSideMenu);
const SideMenu: React.FC<{
  onBoardChange?: (slug: string) => void;
}> = (props) => {
  const { slug, threadId } = usePageDetails();
  const { isPending: isUserPending, isLoggedIn } = useAuth();
  const [boardFilter, setBoardFilter] = React.useState("");
  const { getLinkToBoard } = useCachedLinks();
  const { allBoardsData } = useBoardsData();

  const [dismissNotifications] = useMutation(dismissAllNotifications, {
    onSuccess: () => {
      log(`Successfully dismissed all notifications. Refetching...`);
      queryCache.invalidateQueries("allBoardsData");
      if (slug) {
        queryCache.invalidateQueries(["boardActivityData", { slug }]);
      }
      if (threadId) {
        queryCache.invalidateQueries(["threadData", { threadId }]);
      }
    },
  });
  const { pinnedBoards, recentBoards, allBoards } = React.useMemo(
    () =>
      processBoardsUpdates(
        Object.values(allBoardsData!).reduce((agg, board) => {
          // TODO: figure out why this is happening
          if (!board) {
            return agg;
          }
          agg[board.slug] = {
            slug: board.slug.replace("_", " "),
            avatar: `${board.avatarUrl}`,
            description: board.tagline,
            color: board.accentColor,
            lastUpdate: board.lastUpdate,
            updates: !!(isLoggedIn && board.hasUpdates),
            muted: board.muted,
            link: getLinkToBoard(board.slug, () =>
              props.onBoardChange?.(board.slug)
            ),
            pinnedOrder: board.pinnedOrder,
          };
          return agg;
        }, {} as Parameters<typeof processBoardsUpdates>[0]),
        boardFilter
      ),
    [boardFilter, isLoggedIn, allBoardsData]
  );

  return (
    <MemoizedInnerSideMenu
      pinnedBoards={pinnedBoards}
      recentBoards={
        React.useMemo(() => recentBoards.filter((board, index) => index < 4), [
          recentBoards,
        ]) as any[]
      }
      allBoards={allBoards}
      menuOptions={React.useMemo(
        () =>
          isLoggedIn
            ? [
                {
                  icon: faCommentSlash,
                  name: "Dismiss Notifications",
                  link: { onClick: dismissNotifications },
                },
              ]
            : [],
        [isLoggedIn, dismissNotifications]
      )}
      showRecent={isUserPending || isLoggedIn}
      showPinned={isUserPending || isLoggedIn}
      onFilterChange={setBoardFilter}
    />
  );
};

const Layout = (props: LayoutProps) => {
  const router = useRouter();
  const { linkToHome } = useCachedLinks();
  const { isPending: isUserPending, user, isLoggedIn } = useAuth();
  const [loginOpen, setLoginOpen] = React.useState(false);
  const layoutRef = React.useRef<{ closeSideMenu: () => void }>(null);
  const { currentBoardData, refetchAllBoards, hasUpdates } = useBoardsData();
  const { slug } = usePageDetails();

  return (
    <div>
      {loginOpen && (
        <LoginModal
          isOpen={loginOpen}
          onCloseModal={() => setLoginOpen(false)}
          color={currentBoardData?.accentColor || "#f96680"}
        />
      )}
      <InnerLayout
        ref={layoutRef}
        mainContent={props.mainContent}
        sideMenuContent={
          <SideMenu
            onBoardChange={React.useCallback(
              () => layoutRef.current?.closeSideMenu,
              [layoutRef]
            )}
          />
        }
        actionButton={props.actionButton}
        headerAccent={currentBoardData?.accentColor || "#f96680"}
        onUserBarClick={React.useCallback(
          () => setLoginOpen(!isUserPending && !isLoggedIn),
          [isUserPending, isLoggedIn]
        )}
        loggedInMenuOptions={React.useMemo(
          () =>
            isLoggedIn &&
            getLoginMenuOption({ onLogout: () => setLoginOpen(true) }),
          [isLoggedIn]
        )}
        user={user}
        title={props.title}
        forceHideTitle={props.forceHideTitle}
        loading={props.loading || isUserPending}
        updates={isLoggedIn && hasUpdates}
        onSideMenuButtonClick={refetchAllBoards}
        logoLink={linkToHome}
        menuOptions={React.useMemo(
          () => (isLoggedIn ? LOGGED_IN_MENU_BAR_OPTIONS : EMPTY_OPTIONS),
          [isLoggedIn]
        )}
        selectedMenuOption={getSelectedMenuOptionFromPath(router)}
        titleLink={React.useMemo(
          () =>
            getTitleLinkFromPath({
              onTitleClick: props.onTitleClick,
              slug,
            }),
          [props.onTitleClick, slug]
        )}
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
