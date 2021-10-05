import React from "react";
import {
  Layout as LibraryLayout,
  CustomCursor,
} from "@bobaboard/ui-components";
import Sidemenu from "./SideMenu";
import PinnedMenu from "./PinnedMenu";
import LoginModal from "../LoginModal";
import { useAuth } from "../Auth";
import { useQueryClient } from "react-query";
import { useCachedLinks } from "../hooks/useCachedLinks";
import { useServerCssVariables } from "../hooks/useServerCssVariables";
import { useForceHideIdentity } from "../hooks/useForceHideIdentity";
import { useIsChangingRoute } from "../hooks/useIsChangingRoute";
import {
  useInvalidateNotifications,
  useNotifications,
} from "../hooks/queries/notifications";
import {
  faArchive,
  faBook,
  faCogs,
  faComments,
  faSignOutAlt,
  faLock,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";
import Head from "next/head";
import { getTitle } from "pages/_app";
import { PageTypes, usePageDetails } from "utils/router-utils";
import { useRealmSettings } from "contexts/RealmContext";

import debug from "debug";
import { useBoardSummaryBySlug } from "../hooks/queries/board";
import { BOARD_ACTIVITY_KEY } from "../hooks/queries/board-activity";
// const log = debug("bobafrontend:Layout-log");
const error = debug("bobafrontend:Layout-error");

const useLoggedInDropdownOptions = (openLogin: () => void) => {
  const { forceHideIdentity, toggleForceHideIdentity } = useForceHideIdentity();
  const { linkToPersonalSettings, linkToLogs } = useCachedLinks();
  return React.useMemo(
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
          href: "https://www.notion.so/BobaBoard-s-Welcome-Packet-b0641466bfdf4a1cab8575083459d6a2",
        },
      },
      {
        icon: faComments,
        name: "Leave Feedback!",
        link: {
          href: "https://docs.google.com/forms/d/e/1FAIpQLSfyMENg9eDNmRj-jIvIG5_ElJFwpGZ_VPvzAskarqu5kf0MSA/viewform",
        },
      },
      {
        icon: forceHideIdentity ? faLockOpen : faLock,
        name: forceHideIdentity ? "Display identity" : "Force hide identity",
        link: {
          onClick: toggleForceHideIdentity,
        },
      },
      {
        icon: faSignOutAlt,
        name: "Logout",
        link: { onClick: openLogin },
      },
    ],
    [
      forceHideIdentity,
      openLogin,
      linkToLogs,
      linkToPersonalSettings,
      toggleForceHideIdentity,
    ]
  );
};

interface LayoutComposition {
  MainContent: React.FC<{
    children: React.ReactNode;
  }>;
  ActionButton: React.FC<{
    children: React.ReactNode;
  }>;
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

function useTitleLink() {
  const {
    linkToHome,
    linkToFeed,
    linkToCurrent,
    linkToPersonalSettings,
    getLinkToBoard,
  } = useCachedLinks();
  const queryClient = useQueryClient();
  const { slug, pageType } = usePageDetails();
  const onBoardChange = React.useCallback(
    (slug) => {
      queryClient.refetchQueries([BOARD_ACTIVITY_KEY, { slug }]);
    },
    [queryClient]
  );
  switch (pageType) {
    case PageTypes.THREAD:
    case PageTypes.POST:
    case PageTypes.BOARD:
      if (!slug) {
        error("Attempted to get link to board on page with no slug.");
        return linkToCurrent;
      }
      return getLinkToBoard(slug, onBoardChange);
    case PageTypes.SETTINGS:
      return linkToPersonalSettings;
    case PageTypes.INVITE:
      return linkToCurrent;
    case PageTypes.FEED:
      return linkToFeed;
    default:
      return linkToHome;
  }
}

const Layout: React.FC<LayoutProps> & LayoutComposition = (props) => {
  const { linkToHome } = useCachedLinks();
  const { isPending: isUserPending, user, isLoggedIn } = useAuth();
  const [loginOpen, setLoginOpen] = React.useState(false);
  const layoutRef = React.useRef<{ closeSideMenu: () => void }>(null);
  const { slug } = usePageDetails();
  const titleLink = useTitleLink();
  const { root: rootSettings } = useRealmSettings();
  const currentBoardSummary = useBoardSummaryBySlug(slug);
  const refetchNotifications = useInvalidateNotifications();
  const isChangingRoute = useIsChangingRoute({
    onRouteChange: layoutRef.current?.closeSideMenu,
  });
  const { forceHideIdentity } = useForceHideIdentity();
  const loggedInMenuOptions = useLoggedInDropdownOptions(
    React.useCallback(() => setLoginOpen(true), [])
  );
  const { hasNotifications, notificationsOutdated } = useNotifications();

  const containerRef = React.useRef<HTMLDivElement>(null);
  useServerCssVariables(containerRef);

  const mainContent = React.Children.toArray(props.children).find((child) =>
    isMainContent(child)
  ) as typeof MainContent | undefined;
  const actionButton = React.Children.toArray(props.children).find((child) =>
    isActionButton(child)
  ) as typeof ActionButton | undefined;

  return (
    <div ref={containerRef}>
      <Head>
        <title>{getTitle(currentBoardSummary)}</title>
      </Head>
      <CustomCursor
        cursorImage={rootSettings.cursor?.image}
        cursorTrail={rootSettings.cursor?.trail}
        offset={20}
      />
      {loginOpen && (
        <LoginModal
          isOpen={loginOpen}
          onCloseModal={() => setLoginOpen(false)}
          color={currentBoardSummary?.accentColor || "#f96680"}
        />
      )}
      <LibraryLayout
        ref={layoutRef}
        headerAccent={currentBoardSummary?.accentColor || "#f96680"}
        onUserBarClick={React.useCallback(
          () => setLoginOpen(!isUserPending && !isLoggedIn),
          [isUserPending, isLoggedIn]
        )}
        loggedInMenuOptions={loggedInMenuOptions}
        user={user}
        title={props.title}
        hideTitleOnDesktop={props.forceHideTitle}
        forceHideIdentity={forceHideIdentity}
        loading={props.loading || isUserPending || isChangingRoute}
        userLoading={isUserPending}
        hasNotifications={hasNotifications}
        hasOutdatedNotifications={notificationsOutdated}
        onSideMenuButtonClick={refetchNotifications}
        logoLink={linkToHome}
        titleLink={titleLink}
        onCompassClick={props.onCompassClick}
      >
        <LibraryLayout.SideMenuContent>
          <Sidemenu />
        </LibraryLayout.SideMenuContent>
        <LibraryLayout.PinnedMenuContent>
          <PinnedMenu />
        </LibraryLayout.PinnedMenuContent>
        <LibraryLayout.MainContent>{mainContent}</LibraryLayout.MainContent>
        <LibraryLayout.ActionButton>{actionButton}</LibraryLayout.ActionButton>
      </LibraryLayout>
    </div>
  );
};

export interface LayoutProps {
  loading?: boolean;
  title: string;
  forceHideTitle?: boolean;
  onCompassClick?: () => void;
}

Layout.ActionButton = ActionButton;
Layout.MainContent = MainContent;
export default Layout;
