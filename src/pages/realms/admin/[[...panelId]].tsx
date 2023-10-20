import { BottomBar, DefaultTheme, TabsGroup } from "@bobaboard/ui-components";
import { faCompass, faDoorOpen } from "@fortawesome/free-solid-svg-icons";

import { FeedWithMenu } from "@bobaboard/ui-components";
import InvitesPanel from "components/realm/InvitesPanel";
import Layout from "components/core/layouts/Layout";
import React from "react";
import { RealmPermissions } from "types/Types";
import { hasAdminPanelAccess } from "lib/permissions";
import { useAuth } from "components/Auth";
import { useCachedLinks } from "components/hooks/useCachedLinks";
import { useRealmPermissions } from "contexts/RealmContext";
import { useRouter } from "next/router";

//import debug from "debug";
//const log = debug("bobafrontend:index-log");

export enum AdminPanelIds {
  INVITE_FORM = "invite-form",
  PENDING_INVITES = "pending-invites",
}

const getComponentForAdminPanelId = (id: AdminPanelIds) => {
  switch (id) {
    case AdminPanelIds.INVITE_FORM:
    case AdminPanelIds.PENDING_INVITES:
      return <InvitesPanel />;
  }
};

function AdminPage() {
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

  const userRealmPermissions = useRealmPermissions();

  const currentPanelId =
    (router.query.panelId?.[0] as AdminPanelIds) || AdminPanelIds.INVITE_FORM;

  React.useEffect(() => {
    let top = 0;
    if (currentPanelId && document.getElementById(currentPanelId)) {
      top =
        document.getElementById(currentPanelId)!.getBoundingClientRect().top +
        window.pageYOffset -
        (DefaultTheme.HEADER_HEIGHT_PX + 15);
    }
    window.scroll({
      top,
      behavior: "smooth",
    });
  }, [currentPanelId]);

  React.useEffect(() => {
    if (!isUserPending && !isLoggedIn) {
      linkToHome.onClick();
    }

    if (!isUserPending && !hasAdminPanelAccess(userRealmPermissions)) {
      linkToHome.onClick();
    }
  }, [isLoggedIn, isUserPending, linkToHome, userRealmPermissions]);

  // TODO: see about scrolling between sections in the bottom bar
  return (
    <div className="main">
      <Layout title={`Realm Administration`}>
        <Layout.MainContent>
          <FeedWithMenu showSidebar={showSidebar} onCloseSidebar={closeSidebar}>
            <FeedWithMenu.Sidebar>
              <div className="sidebar-container">
                {userRealmPermissions.includes(
                  RealmPermissions.CREATE_REALM_INVITE
                ) && (
                  <TabsGroup title="Realm Invites" icon={faDoorOpen}>
                    <TabsGroup.Option
                      id={AdminPanelIds.INVITE_FORM}
                      selected={AdminPanelIds.INVITE_FORM == currentPanelId}
                      link={link}
                    >
                      Create Realm Invite
                    </TabsGroup.Option>
                    <TabsGroup.Option
                      id={AdminPanelIds.PENDING_INVITES}
                      selected={AdminPanelIds.PENDING_INVITES == currentPanelId}
                      link={link}
                    >
                      Pending Realm Invites
                    </TabsGroup.Option>
                  </TabsGroup>
                )}
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
                  {getComponentForAdminPanelId(currentPanelId)}
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

export default AdminPage;
