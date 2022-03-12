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

  test("Correctly dismisses board notifications from dropdown menu", async () => {
    render(
      <Client router={BASE_ROUTER}>
        <SideMenu />
      </Client>
    );
  
    //TODO: fill this
  });
  
  test("Board filter correctly filters boards", async () => {
    render(
      <Client router={BASE_ROUTER}>
        <SideMenu />
      </Client>
    );
  
    //TODO: fill this
  });
  
  test("Board filter correctly unfilters boards on entry deletion", async () => {
    render(
      <Client router={BASE_ROUTER}>
        <SideMenu />
      </Client>
    );
  
    //TODO: fill this
  });
  
  test("Renders empty section if no boards match filter search", async () => {
    render(
      <Client router={BASE_ROUTER}>
        <SideMenu />
      </Client>
    );
  
    //TODO: fill this
  });
  
  test("Pinning board adds it to Pinned menu", async () => {
    render(
      <Client router={BASE_ROUTER}>
        <SideMenu />
      </Client>
    );
  
    //TODO: fill this
  });
  
  test("Unpinning board removes it from Pinned menu", async () => {
    render(
      <Client router={BASE_ROUTER}>
        <SideMenu />
      </Client>
    );
  
    //TODO: fill this
  });
});
