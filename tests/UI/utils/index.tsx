import { QueryClient, QueryClientProvider } from "react-query";

import { AuthContext } from "components/Auth";
import { QueryParamProvider } from "components/QueryParamNextProvider";
import React from "react";
import { RealmContextProvider } from "../../../contexts/RealmContext";
import { V0_DATA } from "../../data/Realm";
import { makeRealmData } from "utils/client-data";
import { usePageDataListener } from "utils/router-utils";
import { useRouter } from "next/router";

export const Client = ({ children }: any) => {
  const router = useRouter();
  usePageDataListener(router);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryParamProvider router={router}>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          // @ts-expect-error
          value={{
            isLoggedIn: true,
            isPending: false,
          }}
        >
          <RealmContextProvider initialData={makeRealmData(V0_DATA)}>
            {children}
          </RealmContextProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    </QueryParamProvider>
  );
};
