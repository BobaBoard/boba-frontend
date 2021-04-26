import React from "react";
import { useQuery } from "react-query";
import { useAuth } from "../components/Auth";

interface CssVariableType {
  name: string;
  type: "CssVariable";
  value: string;
}

interface RealmData {
  name: string;
  rootSettings: {
    cursor?: {
      image: string | undefined;
      trail: string | undefined;
    };
  };
  indexPageSettings: CssVariableType[];
  boardPageSettings: CssVariableType[];
  threadPageSettings: CssVariableType[];
}

import debug from "debug";
import { getRealmData } from "../utils/queries/realm";
const log = debug("bobafrontend:contexts:RealmContext-log");
const info = debug("bobafrontend:contexts:RealmContext-info");

const RealmContext = React.createContext<RealmData | undefined>(undefined);

const useRealmContext = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmContext must be used within a RealmContextProvider"
    );
  }
  return context;
};

const RealmContextProvider: React.FC<{
  initialData: RealmData;
  children: React.ReactNode;
}> = ({ initialData, children }) => {
  const realmId = "v0";
  const { isLoggedIn } = useAuth();
  const { data: realmData } = useQuery<RealmData, unknown, RealmData>(
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

export { MemoizedProvider as RealmContextProvider, useRealmContext };
