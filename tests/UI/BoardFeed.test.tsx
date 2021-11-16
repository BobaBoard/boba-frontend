import { Client, getBoardRouter } from "./utils";
import { render, waitFor, within } from "@testing-library/react";

import BoardPage from "pages/[boardId]/index";
import React from "react";

const GORE_ROUTER = getBoardRouter({ boardSlug: "gore" });

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/hooks/useIsChangingRoute");

describe("BoardFeed", () => {
  it("renders sidebar description", async () => {
    render(
      <Client router={GORE_ROUTER}>
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
      <Client router={GORE_ROUTER}>
        <BoardPage />
      </Client>
    );

    await waitFor(() => {
      const mainContainer =
        document.querySelector<HTMLElement>(".content .main");
      expect(
        within(mainContainer!).getByText(
          "Remember to be excellent to each other and only be mean to fictional characters!"
        )
      ).toBeInTheDocument();
    });
  });
});
