import { ImageUploaderContext, ToastContainer } from "@bobaboard/ui-components";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  REALM_QUERY_KEY,
  RealmContextProvider,
} from "../../../contexts/RealmContext";

import { AuthContext } from "components/Auth";
import { NextRouter } from "next/router";
import { QueryParamProvider } from "components/QueryParamNextProvider";
import React from "react";
import { RealmType } from "types/Types";
import { V0_DATA } from "../../server-mocks/data/realm";
import { debug } from "debug";
import { makeRealmData } from "utils/client-data";
import { matchRequestUrl } from "msw";
import { server } from "../../server-mocks";
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
  usePageDataListener(router, undefined);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: Infinity,
      },
    },
  });

  useRouter.mockImplementationOnce(() => router);
  queryClient.setQueryData(
    [
      REALM_QUERY_KEY,
      {
        realmSlug: initialData?.realm?.slug || V0_DATA.slug,
        isLoggedIn: true,
      },
    ],
    initialData?.realm || makeRealmData(V0_DATA)
  );

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
            <ToastContainer />
            <RealmContextProvider>{children}</RealmContextProvider>
          </ImageUploaderContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>
    </QueryParamProvider>
  );
};

export const waitForRequest = (method: string, url: string) => {
  let requestId = "";
  return new Promise((resolve, reject) => {
    server.events.on("request:start", (req) => {
      const matchesMethod = req.method.toLowerCase() === method.toLowerCase();
      const matchesUrl = matchRequestUrl(req.url, url);
      if (matchesMethod && matchesUrl) {
        requestId = req.id;
      }
    });
    server.events.on("request:end", (req) => {
      if (req.id === requestId) {
        resolve(req);
      }
    });
    server.events.on("request:unhandled", (req) => {
      if (req.id === requestId) {
        reject(
          new Error(`The ${req.method} ${req.url.href} request was unhandled.`)
        );
      }
    });
  });
};

export const getThreadRequestPromise = ({ threadId }: { threadId: string }) => {
  return waitForRequest("GET", `/threads/${threadId}`);
};
