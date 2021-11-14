import { render, screen, waitFor } from "@testing-library/react";

import { Client } from "./utils";
import React from "react";
import SideMenu from "components/layout/SideMenu";

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
