import { QueryClient, QueryClientProvider } from "react-query";

import { AuthContext } from "components/Auth";
import { ImageUploaderContext } from "@bobaboard/ui-components";
import { QueryParamProvider } from "components/QueryParamNextProvider";
import React from "react";
import { RealmContextProvider } from "../../../contexts/RealmContext";
import { V0_DATA } from "../../server-mocks/data/realm";
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
          value={{
            isLoggedIn: true,
            isPending: false,
            user: {
              username: "bobatan",
              avatarUrl: "/bobatan.png",
            },
          }}
        >
          <ImageUploaderContext.Provider
            value={{ onImageUploadRequest: jest.fn() }}
          >
            <RealmContextProvider initialData={makeRealmData(V0_DATA)}>
              {children}
            </RealmContextProvider>
          </ImageUploaderContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>
    </QueryParamProvider>
  );
};
