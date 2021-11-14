import { QueryClient, QueryClientProvider } from "react-query";
import { render, screen, waitFor } from "@testing-library/react";

import { AuthContext } from "components/Auth";
import React from "react";
import { RealmContextProvider } from "../../contexts/RealmContext";
import SideMenu from "components/layout/SideMenu";
import { V0_DATA } from "../data/Realm";
import { makeRealmData } from "utils/client-data";
import { server } from "../mocks/index";
import { usePageDataListener } from "utils/router-utils";

// jest.mock("components/Auth", () => require("next-router-mock"));

beforeAll(() =>
  server.listen({
    onUnhandledRequest: ({ method, url }) => {
      server.printHandlers();
    },
  })
);
afterAll(() => server.close());

const Client = ({ children }: any) => {
  usePageDataListener({
    query: {
      boardId: "test",
    },
    push: () => {
      console.log("push");
    },
    prefetch: () => {
      console.log("prefetch");
    },
  } as any);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
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
  );
};

describe("SideMenu", () => {
  it("renders a heading", async () => {
    render(
      <Client>
        <SideMenu />
      </Client>
    );

    await waitFor(() => {
      expect(screen.getByText("recent unreads")).toBeInTheDocument();
    });
  });
});
