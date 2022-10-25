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
import { useRealmContext, useRealmPermissions } from "contexts/RealmContext";

import React from "react";
import { hasAdminPanelAccess } from "utils/permissions-utils";
import { useCachedLinks } from "../hooks/useCachedLinks";
import { useForceHideIdentity } from "../hooks/useForceHideIdentity";

// TODO: make the login component have its own context, then use that function
// here instead of passing it as an argument
export const useLoggedInOptions = (openLogin: () => void) => {
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
        name: "Welcome Guide",
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
