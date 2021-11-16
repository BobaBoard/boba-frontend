import { BASE_ROUTER, Client } from "./utils";
import { render, screen, waitFor } from "@testing-library/react";

import React from "react";
import SideMenu from "components/layout/SideMenu";

describe("SideMenu", () => {
  it("renders a heading", async () => {
    render(
      <Client router={BASE_ROUTER}>
        <SideMenu />
      </Client>
    );

    await waitFor(() => {
      expect(screen.getByText("recent unreads")).toBeInTheDocument();
    });
  });
});
