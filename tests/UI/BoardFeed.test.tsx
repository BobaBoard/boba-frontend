import { Client, getBoardRouter } from "./utils";
import {
  LOGGED_IN_V0_MEMBER_DATA,
  LOGGED_IN_V0_NONMEMBER_DATA,
  V0_DATA,
} from "../server-mocks/data/realm";
import {
  fireEvent,
  prettyDOM,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import BoardPage from "pages/[boardId]/index";
import React from "react";
import { RealmType } from "types/Types";
import { makeRealmData } from "utils/client-data";

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

  it("Allows editing sidebar", async () => {
    render(
      <Client router={GORE_ROUTER}>
        <BoardPage />
      </Client>
    );

    const sidebar = document.querySelector<HTMLElement>(".content .sidebar");
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

  it("renders posts", async () => {
    render(
      <Client router={GORE_ROUTER}>
        <BoardPage />
      </Client>
    );

    await waitFor(() => {
      const mainContainer =
        document.querySelector<HTMLElement>(".content main");
      expect(
        within(mainContainer!).getByText(
          "Remember to be excellent to each other and only be mean to fictional characters!"
        )
      ).toBeInTheDocument();
    });
  });

  it("renders create new thread button when user is a realm member", async () => {
    render(
      <Client
        router={GORE_ROUTER}
        initialData={{
          realm: makeRealmData(LOGGED_IN_V0_MEMBER_DATA) as RealmType,
        }}
      >
        <BoardPage />
      </Client>
    );

    const buttons = screen.getAllByRole("button");

    const createThreadButton = buttons.filter((button) => {
      return (
        button.querySelector(".fab") && button.querySelector(".fa-square-plus")
      );
    });
    expect(createThreadButton).toHaveLength(1);
  });

  it("doesn't render create new thread button when user is not a realm member", async () => {
    render(
      <Client
        router={GORE_ROUTER}
        initialData={{
          realm: makeRealmData(LOGGED_IN_V0_NONMEMBER_DATA) as RealmType,
        }}
      >
        <BoardPage />
      </Client>
    );

    const buttons = screen.getAllByRole("button");

    const createThreadButton = buttons.filter((button) => {
      return (
        button.querySelector(".fab") && button.querySelector(".fa-square-plus")
      );
    });
    expect(createThreadButton).toHaveLength(0);
  });

  it("doesn't render create new thread button when logged out", async () => {
    render(
      <Client
        router={GORE_ROUTER}
        initialData={{
          realm: makeRealmData(V0_DATA) as RealmType,
        }}
      >
        <BoardPage />
      </Client>
    );

    const buttons = screen.getAllByRole("button");

    const createThreadButton = buttons.filter((button) => {
      return (
        button.querySelector(".fab") && button.querySelector(".fa-square-plus")
      );
    });
    expect(createThreadButton).toHaveLength(0);
  });
});
