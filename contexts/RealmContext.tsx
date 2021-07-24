import React from "react";
import { useQuery } from "react-query";
import { useAuth } from "../components/Auth";

import debug from "debug";
import { getRealmData } from "../utils/queries/realm";
import { RealmType } from "types/Types";
//const log = debug("bobafrontend:contexts:RealmContext-log");
const info = debug("bobafrontend:contexts:RealmContext-info");

const RealmContext = React.createContext<RealmType | undefined>(undefined);

const useRealmContext = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmContext must be used within a RealmContextProvider"
    );
  }
  return context;
};

const useRealmSettings = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmSettings must be used within a RealmContextProvider"
    );
  }
  return context.settings;
};

const RealmContextProvider: React.FC<{
  initialData: RealmType;
  children: React.ReactNode;
}> = ({ initialData, children }) => {
  const realmId = "v0";
  const { isLoggedIn } = useAuth();
  const { data: realmData } = useQuery<RealmType, unknown, RealmType>(
    ["realmData", { isLoggedIn, realmId }],
    () => {
      info(
        `Fetching realm data for user ${isLoggedIn ? "" : "NOT "}logged in.`
      );
      return getRealmData({ realmId });
    },
    {
      placeholderData: initialData,
      staleTime: Infinity,
      refetchOnWindowFocus: true,
      notifyOnChangeProps: ["data"],
    }
  );

  return (
    <RealmContext.Provider value={realmData}>{children}</RealmContext.Provider>
  );
};
const MemoizedProvider = React.memo(RealmContextProvider);

export {
  MemoizedProvider as RealmContextProvider,
  useRealmContext,
  useRealmSettings,
};
