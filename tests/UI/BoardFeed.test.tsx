import { render, screen, waitFor, within } from "@testing-library/react";

import BoardPage from "pages/[boardId]/index";
import { Client } from "./utils";
import React from "react";

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/hooks/useIsChangingRoute");

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
