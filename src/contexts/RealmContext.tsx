import { useQuery, useQueryClient } from "react-query";

import React from "react";
import { RealmType } from "types/Types";
import debug from "debug";
import { getCurrentRealmSlug } from "utils/location-utils";
import { getRealmData } from "utils/queries/realm";
import { useAuth } from "components/Auth";

//const log = debug("bobafrontend:contexts:RealmContext-log");
const info = debug("bobafrontend:contexts:RealmContext-info");

const RealmContext = React.createContext<
  | {
      realmData: RealmType;
      dataUpdatedAt: number;
    }
  | undefined
>(undefined);

const useRealmContext = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmContext must be used within a RealmContextProvider"
    );
  }

  return context.realmData;
};

const useRealmContextUpdatedAt = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmContext must be used within a RealmContextProvider"
    );
  }
  return context.dataUpdatedAt;
};

const useRealmSettings = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmSettings must be used within a RealmContextProvider"
    );
  }
  return context.realmData?.settings;
};

const useRealmId = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error("useRealmId must be used within a RealmContextProvider");
  }
  return context.realmData?.id;
};

const useRealmPermissions = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmPermissions must be used within a RealmContextProvider"
    );
  }
  return context.realmData?.realmPermissions;
};

const useRealmBoards = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmSettings must be used within a RealmContextProvider"
    );
  }
  return context.realmData?.boards;
};

const useRealmHomepage = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmHomepage must be used within a RealmContextProvider"
    );
  }
  return context.realmData?.homepage;
};

const useRealmIcon = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error("useRealmIcon must be used within a RealmContextProvider");
  }
  return context.realmData?.icon;
};

const useBoardSummary = ({ boardId }: { boardId?: string | null }) => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmSettings must be used within a RealmContextProvider"
    );
  }
  return context.realmData?.boards.find((summary) => summary.id == boardId);
};

export const useCurrentRealmBoardId = ({
  boardSlug,
}: {
  boardSlug: string | null;
}) => {
  const boards = useRealmBoards();

  if (!boardSlug || !boards) {
    return null;
  }
  return boards.find((board) => board.slug == boardSlug)?.id || null;
};

export const REALM_QUERY_KEY = "realmData";
const RealmContextProvider: React.FC<{
  serverHostname: string | undefined;
  children: React.ReactNode;
}> = ({ children, serverHostname }) => {
  const realmSlug = getCurrentRealmSlug({
    serverHostname,
  });

  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();

  const { data: realmData, dataUpdatedAt } = useQuery<RealmType>(
    [REALM_QUERY_KEY, { isLoggedIn, realmSlug }],
    () => {
      info(
        `Fetching realm data for user ${isLoggedIn ? "" : "NOT "}logged in.`
      );
      return getRealmData({ realmSlug });
    },
    {
      staleTime: Infinity,
      placeholderData: () => {
        console.log(queryClient.getQueryCache());
        const realmQuery = queryClient
          .getQueryCache()
          .findAll([REALM_QUERY_KEY, { realmSlug }], {
            exact: false,
          })
          .filter((query) => !!query.state.data);
        console.log(realmQuery);
        if (!realmQuery.length) {
          throw new Error(
            `No data found for realm ${realmSlug}. Realm data should always be provided.`
          );
        }
        // Find a query for the current logged in state, if available.
        // Note that at this stage at least ONE query must be available.
        const queryForLoggedInState = realmQuery.find(
          (query) => query.queryKey[1]?.["isLoggedIn"] == isLoggedIn
        );
        if (queryForLoggedInState) {
          return queryForLoggedInState.state.data as RealmType;
        }
        if (isLoggedIn) {
          // We are logged in, but the query we have is for not-logged in users. That's fine, because
          // there's no risk of data leak
          return realmQuery[0].state.data as RealmType;
        }
        // At this point, we know we're not logged in, but that the query we have access to is for logged in
        // data. We don't want to accidentally leak anything, so let's only return the "safe" data.
        const loggedInRealmData = realmQuery[0].state.data as RealmType;
        return {
          ...loggedInRealmData,
          permissions: [],
          feedbackFormUrl: null,
          // TODO: distinguish realm and user settings, and remove the user
          // settings.
        };
      },
      refetchInterval: 60 * 1000,
      refetchOnWindowFocus: true,
      notifyOnChangeProps: ["data", "dataUpdatedAt"],
    }
  );

  return (
    <RealmContext.Provider
      value={React.useMemo(
        () => ({
          realmData: realmData!,
          dataUpdatedAt,
        }),
        [realmData, dataUpdatedAt]
      )}
    >
      {children}
    </RealmContext.Provider>
  );
};
const MemoizedProvider = React.memo(RealmContextProvider);

export {
  MemoizedProvider as RealmContextProvider,
  useRealmContext,
  useRealmSettings,
  useRealmId,
  useRealmPermissions,
  useRealmBoards,
  useRealmHomepage,
  useRealmIcon,
  useRealmContextUpdatedAt,
  useBoardSummary,
};
