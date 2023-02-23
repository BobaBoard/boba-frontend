import {
  CustomCursor,
  DefaultTheme,
  Layout as LibraryLayout,
} from "@bobaboard/ui-components";
import { PageTypes, usePageDetails } from "utils/router-utils";
import {
  useInvalidateNotifications,
  useNotifications,
} from "lib/api/hooks/notifications";
import { useRealmContext, useRealmSettings } from "contexts/RealmContext";

import { BOARD_ACTIVITY_KEY } from "lib/api/hooks/board-feed";
import LoginModal from "./LoginModal";
import PinnedMenu from "./PinnedMenu";
import React from "react";
import Sidemenu from "./SideMenu";
import debug from "debug";
import { useAuth } from "components/Auth";
import { useBoardSummaryBySlug } from "lib/api/hooks/board";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useForceHideIdentity } from "components/hooks/useForceHideIdentity";
import { useIsChangingRoute } from "components/core/useIsChangingRoute";
import { useLoggedInOptions } from "components/options/useLoggedInOptions";
import { useQueryClient } from "react-query";
import { useServerCssVariables } from "components/hooks/useServerCssVariables";

// const log = debug("bobafrontend:Layout-log");
const error = debug("bobafrontend:Layout-error");

interface LayoutComposition {
  MainContent: React.FC<{
    children: React.ReactNode;
  }>;
  BottomBar: React.FC<{
    children: React.ReactNode;
  }>;
}

const MainContent: LayoutComposition["MainContent"] = (props) => {
  return <>{props.children}</>;
};

const BottomBar: LayoutComposition["BottomBar"] = (props) => {
  return <>{props.children}</>;
};

const isMainContent = (node: React.ReactNode): node is typeof MainContent => {
  return React.isValidElement(node) && node.type == MainContent;
};
const isBottomBar = (node: React.ReactNode): node is typeof BottomBar => {
  return React.isValidElement(node) && node.type == BottomBar;
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
  const loggedInMenuOptions = useLoggedInOptions(openLogin);

  const containerRef = React.useRef<HTMLDivElement>(null);
  useServerCssVariables(containerRef);

  const mainContent = React.Children.toArray(props.children).find((child) =>
    isMainContent(child)
  ) as typeof MainContent | undefined;
  const bottomBar = React.Children.toArray(props.children).find((child) =>
    isBottomBar(child)
  ) as typeof BottomBar | undefined;

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
      >
        <LibraryLayout.SideMenuContent>
          <Sidemenu />
        </LibraryLayout.SideMenuContent>
        <LibraryLayout.PinnedMenuContent>
          <PinnedMenu />
        </LibraryLayout.PinnedMenuContent>
        <LibraryLayout.MainContent>{mainContent}</LibraryLayout.MainContent>
        {bottomBar && (
          <LibraryLayout.BottomBar>{bottomBar}</LibraryLayout.BottomBar>
        )}
      </LibraryLayout>
    </div>
  );
};

export interface LayoutProps {
  loading?: boolean;
  title: string;
  forceHideTitle?: boolean;
}

Layout.MainContent = MainContent;
Layout.BottomBar = BottomBar;
export default Layout;
