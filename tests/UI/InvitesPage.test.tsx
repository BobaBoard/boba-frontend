import {
  Client,
  getAdminPanelRoute,
  getInvitesPageRoute,
  LoggedOutClient,
} from "./utils";
import {
  LOGGED_IN_V0_DATA,
  V0_CREATED_INVITE,
  V0_DATA,
  V0_INVITES,
} from "../server-mocks/data/realm";
import { render, screen, waitFor, within } from "@testing-library/react";

import AdminPage from "pages/realms/admin/[[...panelId]]";
import InvitesPage from "pages/invites/[inviteId]";
import React from "react";
import debug from "debug";
import { format } from "date-fns";
import { makeRealmData } from "utils/client-data";
import { matchMedia } from "@shopify/jest-dom-mocks";
import { rest } from "msw";
import { server } from "../server-mocks";
import userEvent from "@testing-library/user-event";
import { getRealmNameFromSlug } from "utils/text-utils";

const log = debug("bobafrontend:tests:UI:InvitesPage");

const INVITES_ROUTER = getInvitesPageRoute({
  nonce: "QRSnew_invite_codeXYZ",
});

const V0_REALM_NAME = getRealmNameFromSlug(V0_DATA.slug);

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/hooks/useIsChangingRoute");

describe("InvitesPanel", () => {
  test("renders logged out invite page", async () => {
    render(
      <LoggedOutClient
        router={INVITES_ROUTER}
        initialData={{ realm: makeRealmData(V0_DATA) }}
      >
        <InvitesPage
          realmSlug={V0_DATA.slug}
          realmId={V0_CREATED_INVITE.realm_id}
          inviteStatus="pending"
        />
      </LoggedOutClient>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      `You've been invited to join ${V0_REALM_NAME}!`
    );
    expect(screen.getByLabelText("Email")).toBeVisible();
    expect(screen.getByLabelText("Password")).toBeVisible();
    expect(screen.getByRole("button", { name: `Login` })).toBeVisible();
    expect(
      screen.getByRole("button", { name: `Join ${V0_REALM_NAME}` })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: `Join ${V0_REALM_NAME}` })
    ).toBeDisabled();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveTextContent("Welcome Guide");
    expect(links[1]).toHaveTextContent("Twitter");
    expect(links[2]).toHaveTextContent("Tumblr");
    expect(links[3]).toHaveTextContent("BobaBoard.com");
  });

  test("renders logged in invite page", async () => {
    render(
      <Client
        router={INVITES_ROUTER}
        initialData={{ realm: makeRealmData(V0_DATA) }}
      >
        <InvitesPage
          realmSlug={V0_DATA.slug}
          realmId={V0_CREATED_INVITE.realm_id}
          inviteStatus="pending"
        />
      </Client>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      `You've been invited to join ${V0_REALM_NAME}!`
    );
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: `Login` })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Join ${V0_REALM_NAME}` })
    ).toBeVisible();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent("Go back to V0");
  });

  test("Redirects when user is logged in and already a member of the realm", async () => {
    render(
      <Client
        router={INVITES_ROUTER}
        initialData={{ realm: makeRealmData(V0_DATA) }}
      >
        <InvitesPage
          realmSlug={V0_DATA.slug}
          realmId={V0_CREATED_INVITE.realm_id}
          inviteStatus="pending"
        />
      </Client>
    );

    // TODO: fill this
  });

  test("Correctly renders error message if invite used", async () => {
    render(
      <Client
        router={INVITES_ROUTER}
        initialData={{ realm: makeRealmData(V0_DATA) }}
      >
        <InvitesPage
          realmSlug={V0_DATA.slug}
          realmId={V0_CREATED_INVITE.realm_id}
          inviteStatus="used"
        />
      </Client>
    );

    expect(
      screen.getByRole("button", { name: `Join ${V0_REALM_NAME}` })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: `Join ${V0_REALM_NAME}` })
    ).toBeDisabled();
    expect(screen.getByText("This invite has already been used."));
  });

  test("Correctly renders error message if invite expired", async () => {
    render(
      <Client
        router={INVITES_ROUTER}
        initialData={{ realm: makeRealmData(V0_DATA) }}
      >
        <InvitesPage
          realmSlug={V0_DATA.slug}
          realmId={V0_CREATED_INVITE.realm_id}
          inviteStatus="expired"
        />
      </Client>
    );

    expect(
      screen.getByRole("button", { name: `Join ${V0_REALM_NAME}` })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: `Join ${V0_REALM_NAME}` })
    ).toBeDisabled();
    expect(screen.getByText("This invite has expired."));
  });

  test("Correctly opens login modal", async () => {
    render(
      <LoggedOutClient
        router={INVITES_ROUTER}
        initialData={{ realm: makeRealmData(V0_DATA) }}
      >
        <InvitesPage
          realmSlug={V0_DATA.slug}
          realmId={V0_CREATED_INVITE.realm_id}
          inviteStatus="pending"
        />
      </LoggedOutClient>
    );

    expect(screen.getByRole("button", { name: `Login` })).toBeVisible();
    userEvent.click(screen.getByRole("button", { name: `Login` }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeVisible();
      expect(screen.getByRole("button", { name: `Cancel` })).toBeVisible();
    });
    userEvent.click(screen.getByRole("button", { name: `Cancel` }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: `Cancel` })
      ).not.toBeInTheDocument();
    });
  });

  test("Correctly accepts invite when logged in", async () => {
    render(
      <Client
        router={INVITES_ROUTER}
        initialData={{ realm: makeRealmData(V0_DATA) }}
      >
        <InvitesPage
          realmSlug={V0_DATA.slug}
          realmId={V0_CREATED_INVITE.realm_id}
          inviteStatus="pending"
        />
      </Client>
    );

    // TODO: fill this
  });

  test("Correctly accepts invite when logged out", async () => {
    render(
      <LoggedOutClient
        router={INVITES_ROUTER}
        initialData={{ realm: makeRealmData(V0_DATA) }}
      >
        <InvitesPage
          realmSlug={V0_DATA.slug}
          realmId={V0_CREATED_INVITE.realm_id}
          inviteStatus="pending"
        />
      </LoggedOutClient>
    );

    // TODO: fill this
  });
});
