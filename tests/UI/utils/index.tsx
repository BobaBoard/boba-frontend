import { QueryClient, QueryClientProvider } from "react-query";

import { AuthContext } from "components/Auth";
import { ImageUploaderContext } from "@bobaboard/ui-components";
import { NextRouter } from "next/router";
import { QueryParamProvider } from "components/QueryParamNextProvider";
import React from "react";
import { RealmContextProvider } from "../../../contexts/RealmContext";
import { RealmType } from "types/Types";
import { V0_DATA } from "../../server-mocks/data/realm";
import { debug } from "debug";
import { makeRealmData } from "utils/client-data";
import { usePageDataListener } from "utils/router-utils";

const useRouter = jest.spyOn(require("next/router"), "useRouter");

const routerInfo = debug("bobatest:router");

export const BASE_ROUTER: NextRouter = {
  asPath: "/",
  basePath: "",
  route: "/",
  pathname: "/",
  query: {},
  push: async (...args) => {
    routerInfo("push", args);
    return true;
  },
  prefetch: async () => {
    routerInfo("prefetch");
  },
  replace: async () => {
    routerInfo("replace");
    return true;
  },
  reload: async () => {
    routerInfo("reload");
  },
  back: async () => {
    routerInfo("back");
  },
  beforePopState: async () => {
    routerInfo("beforePopState");
  },
  events: {
    on: () => {
      routerInfo("on");
    },
    off: () => {
      routerInfo("off");
    },
    emit: () => {
      routerInfo("emit");
    },
  },
  isFallback: false,
};

export const getThreadRouter = ({
  boardSlug,
  threadId,
}: {
  boardSlug: string;
  threadId: string;
}): NextRouter => ({
  ...BASE_ROUTER,
  asPath: `/!${boardSlug}/thread/${threadId}`,
  basePath: "",
  route: "/[boardId]/thread/[...threadId]",
  pathname: "/[boardId]/thread/[...threadId]",
  query: {
    boardId: `!${boardSlug}`,
    threadId: [threadId],
  },
});

export const getBoardRouter = ({
  boardSlug,
}: {
  boardSlug: string;
}): NextRouter => ({
  ...BASE_ROUTER,
  asPath: `/!${boardSlug}`,
  basePath: "",
  route: "/[boardId]",
  pathname: "/[boardId]",
  query: {
    boardId: `!${boardSlug}`,
  },
});

export const getUserSettingsRoute = ({
  settingSection,
}: {
  settingSection: string;
}): NextRouter => ({
  ...BASE_ROUTER,
  pathname: "/users/settings/[[...settingId]]",
  route: "/users/settings/[[...settingId]]",
  query: {
    settingId: [settingSection],
  },
  asPath: `/users/settings/${settingSection}`,
  basePath: "",
});

export const Client = ({
  children,
  router,
  initialData,
}: {
  children: React.ReactNode;
  router: NextRouter;
  initialData?: {
    realm?: RealmType;
  };
}) => {
  const [userData, setUserData] = React.useState<{
    username: string;
    avatarUrl: string;
  }>({
    username: "bobatan",
    avatarUrl: "/bobatan.png",
  });
  usePageDataListener(router);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  useRouter.mockImplementationOnce(() => router);

  return (
    <QueryParamProvider router={router}>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            isLoggedIn: true,
            isPending: false,
            user: userData,
            refreshUserData: setUserData,
          }}
        >
          <ImageUploaderContext.Provider
            value={{ onImageUploadRequest: jest.fn() }}
          >
            <RealmContextProvider
              initialData={initialData?.realm || makeRealmData(V0_DATA)}
            >
              {children}
            </RealmContextProvider>
          </ImageUploaderContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>
    </QueryParamProvider>
  );
};
