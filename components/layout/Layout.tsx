import {
  CustomCursor,
  DefaultTheme,
  Layout as LibraryLayout,
} from "@bobaboard/ui-components";
import { PageTypes, usePageDetails } from "utils/router-utils";
import {
  faArchive,
  faBook,
  faCogs,
  faComments,
  faCrown,
  faLock,
  faLockOpen,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  useInvalidateNotifications,
  useNotifications,
} from "queries/notifications";
import {
  useRealmContext,
  useRealmPermissions,
  useRealmSettings,
} from "contexts/RealmContext";

import { BOARD_ACTIVITY_KEY } from "queries/board-feed";
import LoginModal from "../LoginModal";
import PinnedMenu from "./PinnedMenu";
import React from "react";
import Sidemenu from "./SideMenu";
import debug from "debug";
import { hasAdminPanelAccess } from "utils/permissions-utils";
import { useAuth } from "components/Auth";
import { useBoardSummaryBySlug } from "queries/board";
import { useCachedLinks } from "../hooks/useCachedLinks";
import { useForceHideIdentity } from "../hooks/useForceHideIdentity";
import { useIsChangingRoute } from "../hooks/useIsChangingRoute";
import { useQueryClient } from "react-query";
import { useServerCssVariables } from "../hooks/useServerCssVariables";

// const log = debug("bobafrontend:Layout-log");
const error = debug("bobafrontend:Layout-error");

const useLoggedInDropdownOptions = (openLogin: () => void) => {
  const { forceHideIdentity, toggleForceHideIdentity } = useForceHideIdentity();
  const { linkToPersonalSettings, linkToLogs, linkToRealmAdmin } =
    useCachedLinks();
  const userRealmPermissions = useRealmPermissions();
  const realmData = useRealmContext();

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
      ...(hasAdminPanelAccess(userRealmPermissions)
        ? [
            {
              icon: faCrown,
              name: "Realm Administration",
              link: linkToRealmAdmin,
            },
          ]
        : []),
      {
        icon: faBook,
        name: "User Guide",
        link: {
          href: "https://docs.bobaboard.com/docs/users/intro",
        },
      },
      {
        icon: faComments,
        name: "Leave Feedback!",
        link: {
          href:
            realmData.feedbackFormUrl ||
            "https://docs.google.com/forms/d/e/1FAIpQLSfyMENg9eDNmRj-jIvIG5_ElJFwpGZ_VPvzAskarqu5kf0MSA/viewform",
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
      linkToRealmAdmin,
      toggleForceHideIdentity,
      userRealmPermissions,
      realmData.feedbackFormUrl,
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
    linkToRealmAdmin,
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
    case PageTypes.ADMIN:
      return linkToRealmAdmin;
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
  const { id: realmId } = useRealmContext();
  const { hasNotifications, notificationsOutdated } = useNotifications({
    realmId,
  });
  const openLogin = React.useCallback(() => setLoginOpen(true), []);
  const loggedInMenuOptions = useLoggedInDropdownOptions(openLogin);

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
      <CustomCursor
        cursorImage={rootSettings.cursor?.image}
        cursorTrail={rootSettings.cursor?.trail}
        offset={20}
      />
      {loginOpen && (
        <LoginModal
          isOpen={loginOpen}
          onCloseModal={() => {
            setLoginOpen(false);
          }}
          color={currentBoardSummary?.accentColor || "#f96680"}
        />
      )}
      <LibraryLayout
        ref={layoutRef}
        accentColor={currentBoardSummary?.accentColor || "#f96680"}
        notificationIcon={
          hasNotifications
            ? {
                color: notificationsOutdated
                  ? DefaultTheme.NOTIFICATIONS_OUTDATED_COLOR
                  : DefaultTheme.NOTIFICATIONS_NEW_COLOR,
              }
            : undefined
        }
        onUserBarClick={React.useMemo(
          () => ({
            onClick: () => setLoginOpen(!isUserPending && !isLoggedIn),
          }),
          [isUserPending, isLoggedIn]
        )}
        user={React.useMemo(
          () => ({
            name: user?.username,
            avatar: user?.avatarUrl,
            loading: isUserPending,
            menuOptions: loggedInMenuOptions,
          }),
          [user, isUserPending, loggedInMenuOptions]
        )}
        title={props.title}
        hideTitleFromDesktopHeader={props.forceHideTitle}
        forceHideIdentity={forceHideIdentity}
        loading={props.loading || isUserPending || isChangingRoute}
        onSideMenuStatusChange={React.useCallback(
          (status) => {
            if (status == "opening") {
              refetchNotifications();
            }
          },
          [refetchNotifications]
        )}
        logoLink={linkToHome}
        titleLink={titleLink}
        onCompassClick={React.useMemo(
          () => ({
            onClick: props.onCompassClick,
          }),
          [props.onCompassClick]
        )}
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
