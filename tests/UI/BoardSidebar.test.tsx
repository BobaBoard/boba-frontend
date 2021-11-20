import { Client, getBoardRouter } from "./utils";
import {
  fireEvent,
  prettyDOM,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import BoardPage from "pages/[boardId]/index";
import { LOGGED_IN_V0_DATA } from "../server-mocks/data/realm";
import React from "react";
import { makeRealmData } from "utils/client-data";

const GORE_ROUTER = getBoardRouter({ boardSlug: "gore" });

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/hooks/useIsChangingRoute");

const renderSidebar = () => {
  render(
    <Client
      router={GORE_ROUTER}
      initialData={{ realm: makeRealmData(LOGGED_IN_V0_DATA) }}
    >
      <BoardPage />
    </Client>
  );

  return { sidebar: document.querySelector<HTMLElement>(".content .sidebar") };
};

describe("BoardFeed", () => {
  it("renders sidebar description", async () => {
    const { sidebar } = renderSidebar();

    await waitFor(() => {
      expect(
        within(sidebar!).getByText("Blood! Blood! Blood!")
      ).toBeInTheDocument();
      expect(within(sidebar!).getByText("pls b nice")).toBeInTheDocument();
      expect(within(sidebar!).getByText("blood")).toBeInTheDocument();
      expect(within(sidebar!).getByText("bruises")).toBeInTheDocument();
    });
  });

  it("Allows editing sidebar", async () => {
    const { sidebar } = renderSidebar();

    expect(within(sidebar!).getByLabelText("Board options")).toBeVisible();

    fireEvent.click(within(sidebar!).getByLabelText("Board options"));

    await waitFor(() => {
      expect(screen.getByText("Edit Board")).toBeVisible();
    });

    fireEvent.click(screen.getByText("Edit Board"));

    await waitFor(() => {
      expect(within(sidebar!).getByText("Save")).toBeVisible();
    });
  });

  it("Allows muting board", async () => {
    const { sidebar } = renderSidebar();

    expect(within(sidebar!).getByLabelText("Board options")).toBeVisible();
    fireEvent.click(within(sidebar!).getByLabelText("Board options"));

    await waitFor(() => {
      expect(screen.getByText("Mute")).toBeVisible();
    });

    fireEvent.click(screen.getByText("Mute"));

    await waitFor(() => {
      const mutedIcon = sidebar?.querySelector(".muted-icon");
      expect(mutedIcon).toBeTruthy();
    });

    // Check that board now asks to unmute

    expect(within(sidebar!).getByLabelText("Board options")).toBeVisible();
    fireEvent.click(within(sidebar!).getByLabelText("Board options"));

    await waitFor(() => {
      expect(screen.getByText("Unmute")).toBeVisible();
    });
  });

  //   it("Allows pinning board", async () => {
  //     render(
  //       <Client router={GORE_ROUTER}>
  //         <BoardPage />
  //       </Client>
  //     );

  //     const sidebar = document.querySelector<HTMLElement>(".content .sidebar");
  //     expect(within(sidebar!).getByLabelText("Board options")).toBeVisible();

  //     fireEvent.click(within(sidebar!).getByLabelText("Board options"));

  //     await waitFor(() => {
  //       expect(screen.getByText("Edit Board")).toBeVisible();
  //     });

  //     fireEvent.click(screen.getByText("Edit Board"));

  //     await waitFor(() => {
  //       expect(within(sidebar!).getByText("Save")).toBeVisible();
  //     });
  //   });

  //   it("Allows dismissing board notifications", async () => {
  //     render(
  //       <Client router={GORE_ROUTER}>
  //         <BoardPage />
  //       </Client>
  //     );

  //     const sidebar = document.querySelector<HTMLElement>(".content .sidebar");
  //     expect(within(sidebar!).getByLabelText("Board options")).toBeVisible();

  //     fireEvent.click(within(sidebar!).getByLabelText("Board options"));

  //     await waitFor(() => {
  //       expect(screen.getByText("Edit Board")).toBeVisible();
  //     });

  //     fireEvent.click(screen.getByText("Edit Board"));

  //     await waitFor(() => {
  //       expect(within(sidebar!).getByText("Save")).toBeVisible();
  //     });
  //   });
});
