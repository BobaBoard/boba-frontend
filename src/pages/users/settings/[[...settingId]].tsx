import { BottomBar, DefaultTheme, TabsGroup } from "@bobaboard/ui-components";
import {
  faCompass,
  faHollyBerry,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import DecorationsSettings from "components/settings/DecorationsSettings";
import { FeedWithMenu } from "@bobaboard/ui-components";
import Layout from "components/core/layouts/Layout";
import React from "react";
import UserSettings from "components/settings/UserSettings";
import { useAuth } from "components/Auth";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useRouter } from "next/router";

//import debug from "debug";
//const log = debug("bobafrontend:index-log");

export enum SettingPageIds {
  DISPLAY_DATA = "display-data",
  BOBADEX = "bobadex",
  DECORATIONS = "decorations",
}

const getComponentForSettingId = (id: SettingPageIds) => {
  switch (id) {
    case SettingPageIds.DISPLAY_DATA:
    case SettingPageIds.BOBADEX:
      return <UserSettings />;
    case SettingPageIds.DECORATIONS:
      return <DecorationsSettings />;
  }
};

function UserPage() {
  const { isPending: isUserPending, isLoggedIn } = useAuth();
  const { linkToHome } = useCachedLinks();
  const [showSidebar, setShowSidebar] = React.useState(false);
  const closeSidebar = React.useCallback(() => setShowSidebar(false), []);
  const onCompassClick = React.useCallback(
    () => setShowSidebar(!showSidebar),
    [showSidebar]
  );

  const router = useRouter();

  const link = React.useMemo(
    () => ({
      onClick: (link: string | undefined) => {
        router.push(
          router.route,
          router.pathname.substr(0, router.pathname.indexOf("[[")) + link
        );
      },
    }),
    [router]
  );

  const currentSettingId =
    (router.query.settingId?.[0] as SettingPageIds) ||
    SettingPageIds.DISPLAY_DATA;

  React.useEffect(() => {
    let top = 0;
    if (currentSettingId && document.getElementById(currentSettingId)) {
      top =
        document.getElementById(currentSettingId)!.getBoundingClientRect().top +
        window.pageYOffset -
        (DefaultTheme.HEADER_HEIGHT_PX + 15);
    }
    window.scroll({
      top,
      behavior: "smooth",
    });
  }, [currentSettingId]);

  React.useEffect(() => {
    if (!isUserPending && !isLoggedIn) {
      linkToHome.onClick();
    }
  }, [isLoggedIn, isUserPending, linkToHome]);

  return (
    <div className="main">
      <Layout title={`Settings`}>
        <Layout.MainContent>
          <FeedWithMenu showSidebar={showSidebar} onCloseSidebar={closeSidebar}>
            <FeedWithMenu.Sidebar>
              <div className="sidebar-container">
                <TabsGroup title="User Data" icon={faUser}>
                  <TabsGroup.Option
                    id={SettingPageIds.DISPLAY_DATA}
                    selected={SettingPageIds.DISPLAY_DATA == currentSettingId}
                    link={link}
                  >
                    Name & Avatar
                  </TabsGroup.Option>
                  <TabsGroup.Option
                    id={SettingPageIds.BOBADEX}
                    selected={SettingPageIds.BOBADEX == currentSettingId}
                    link={link}
                  >
                    BobaDex
                  </TabsGroup.Option>
                </TabsGroup>
                <TabsGroup title="Decorations" icon={faHollyBerry}>
                  <TabsGroup.Option
                    id={SettingPageIds.DECORATIONS}
                    selected={SettingPageIds.DECORATIONS == currentSettingId}
                    link={link}
                  >
                    Global Settings
                  </TabsGroup.Option>
                </TabsGroup>
                <style jsx>{`
                  .sidebar-container {
                    padding: 30px 20px;
                  }
                `}</style>
              </div>
            </FeedWithMenu.Sidebar>
            <FeedWithMenu.FeedContent>
              <div className="page">
                <div className="settings-section">
                  {getComponentForSettingId(currentSettingId)}
                </div>
                <style jsx>{`
                  .page {
                    font-size: var(--font-size-normal);
                    width: 80%;
                    max-width: 800px;
                    color: white;
                    margin: 10px auto;
                    padding-bottom: 100px;
                  }

                  .settings-section + .settings-section {
                    margin-top: 20px;
                  }
                `}</style>
              </div>
            </FeedWithMenu.FeedContent>
          </FeedWithMenu>
        </Layout.MainContent>
        <Layout.BottomBar>
          <BottomBar
            accentColor={DefaultTheme.DEFAULT_ACCENT_COLOR}
            contextMenu={{
              icons: [],
              options: [],
            }}
          >
            <BottomBar.Button
              id="compass"
              icon={{ icon: faCompass }}
              link={{ onClick: onCompassClick }}
              position="left"
              desktopOnly
            />
          </BottomBar>
        </Layout.BottomBar>
      </Layout>
    </div>
  );
}

export default UserPage;
