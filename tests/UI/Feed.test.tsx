import { QueryClient, QueryClientProvider } from "react-query";
import { render, screen, waitFor, within } from "@testing-library/react";

import { AuthContext } from "components/Auth";
import BoardPage from "pages/[boardId]/index";
import { QueryParamProvider } from "components/QueryParamNextProvider";
import React from "react";
import { RealmContextProvider } from "../../contexts/RealmContext";
import { V0_DATA } from "../data/Realm";
import { makeRealmData } from "utils/client-data";
import { usePageDataListener } from "utils/router-utils";
import { useRouter } from "next/router";

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/hooks/useIsChangingRoute");

const Client = ({ children }: any) => {
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

describe("BoardFeed", () => {
  it("renders sidebar description", async () => {
    render(
      <Client>
        <BoardPage />
      </Client>
    );

    await waitFor(() => {
      const sidebar = document.querySelector<HTMLElement>(".content .sidebar");
      expect(
        within(sidebar!).getByText("Blood! Blood! Blood!")
      ).toBeInTheDocument();
      expect(within(sidebar!).getByText("pls b nice")).toBeInTheDocument();
      expect(within(sidebar!).getByText("blood")).toBeInTheDocument();
      expect(within(sidebar!).getByText("bruises")).toBeInTheDocument();
    });
  });

  it("renders posts", async () => {
    render(
      <Client>
        <BoardPage />
      </Client>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Remember to be excellent to each other and only be mean to fictional characters!"
        )
      ).toBeInTheDocument();
    });
  });
});
