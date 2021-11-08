import { QueryClient, QueryClientProvider } from "react-query";
import { act, renderHook } from "@testing-library/react-hooks";
import { render, screen, waitFor } from "@testing-library/react";

import { BOARDS_INITIAL_DATA } from "../board-utils/sideMenuOrdering.test";
import React from "react";
import { RealmContextProvider } from "../../contexts/RealmContext";
import Router from "next-router-mock";
import SideMenu from "../../components/layout/SideMenu";
import { usePageDataListener } from "../../utils/router-utils";

jest.mock("next/router", () => require("next-router-mock"));

beforeEach((done) => {
  renderHook(() => usePageDataListener(Router));
  act(() => done());
});

const renderWithClient = (element: React.ReactElement) => {
  // From: https://github.com/tannerlinsley/react-query/blob/ead2e5dd5237f3d004b66316b5f36af718286d2d/src/react/tests/utils.tsx#L6-L17
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const { rerender, ...result } = render(
    <QueryClientProvider client={queryClient}>
      <RealmContextProvider
        initialData={{
          boards: BOARDS_INITIAL_DATA,
        }}
      >
        {element}
      </RealmContextProvider>
    </QueryClientProvider>
  );
  return {
    ...result,
    rerender: (rerenderUi: React.ReactElement) =>
      rerender(
        <QueryClientProvider client={queryClient}>
          {rerenderUi}
        </QueryClientProvider>
      ),
  };
};

describe("Home", () => {
  it("renders a heading", async () => {
    renderWithClient(<SideMenu />);

    await waitFor(() => {
      const heading = screen.getByRole("heading", {
        name: /welcome to next\.js!/i,
      });
      expect(heading).toBeInTheDocument();
    });
  });
});
