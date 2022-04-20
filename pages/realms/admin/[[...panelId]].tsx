import { DefaultTheme, TabsGroup } from "@bobaboard/ui-components";

import { FeedWithMenu } from "@bobaboard/ui-components";
import InvitesPanel from "components/realm/InvitesPanel";
import Layout from "components/layout/Layout";
import React from "react";
import { faDoorOpen } from "@fortawesome/free-solid-svg-icons";
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
    // This will require a more complicated check if we add realm permissions that shouldn't grant access to the Realm Admin page
    if (!isUserPending && !userRealmPermissions.length) {
      linkToHome.onClick();
    }
  }, [isLoggedIn, isUserPending, linkToHome, userRealmPermissions]);

  return (
    <div className="main">
      <Layout title={`Realm Administration`} onCompassClick={onCompassClick}>
        <Layout.MainContent>
          <FeedWithMenu showSidebar={showSidebar} onCloseSidebar={closeSidebar}>
            <FeedWithMenu.Sidebar>
              <div className="sidebar-container">
                {userRealmPermissions.includes("create_realm_invite") && (
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
      </Layout>
    </div>
  );
}

export default AdminPage;
