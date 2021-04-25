import React, { useEffect } from "react";
import Layout from "components/Layout";
import { updateUserData, getBobadex } from "utils/queries/user";
import { useQuery, useMutation } from "react-query";
import {
  UserDetails,
  BobaDex,
  TabsGroup,
  SettingsContainer,
  SettingType,
} from "@bobaboard/ui-components";
import { v4 as uuidv4 } from "uuid";
import firebase from "firebase/app";
import debug from "debug";
import { useAuth } from "components/Auth";
import { Router, useRouter } from "next/router";
import { FeedWithMenu } from "@bobaboard/ui-components";
import { faHollyBerry, faUser } from "@fortawesome/free-solid-svg-icons";
import UserSettings from "components/settings/UserSettings";
import DecorationsSettings from "components/settings/DecorationsSettings";

const log = debug("bobafrontend:index-log");

enum SettingPageIds {
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
  // const {
  //   isPending: isUserPending,
  //   user,
  //   isLoggedIn,
  //   refreshUserData,
  // } = useAuth();

  const router = useRouter();

  const link = React.useMemo(
    () => ({
      onClick: (link: string | undefined) => {
        console.log(router);
        router.push(
          router.route,
          router.pathname.substr(0, router.pathname.indexOf("[[")) + link,
          {
            shallow: true,
          }
        );
      },
    }),
    [router]
  );

  // TODO: redirect upon log out.

  const currentSettingId =
    (router.query.settingId?.[0] as SettingPageIds) ||
    SettingPageIds.DISPLAY_DATA;

  return (
    <div className="main">
      <Layout title={`Settings`}>
        <Layout.MainContent>
          <FeedWithMenu>
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

export default UserPage;
