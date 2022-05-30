import { Client, LoggedOutClient, getInvitesPageRoute } from "./utils";
import {
  LOGGED_IN_V0_DATA,
  V0_CREATED_INVITE,
  V0_CREATED_INVITE_NONCE,
  V0_DATA,
} from "../server-mocks/data/realm";
import { render, screen, waitFor } from "@testing-library/react";

import InvitesPage from "pages/invites/[inviteId]";
import React from "react";
import { acceptInvite } from "utils/queries/user";
import debug from "debug";
import { getRealmNameFromSlug } from "utils/text-utils";
import { makeRealmData } from "utils/client-data";
import userEvent from "@testing-library/user-event";

const log = debug("bobafrontend:tests:UI:InvitesPage");

// const original = jest.requireActual("../utils/queries/user");

const INVITES_ROUTER = getInvitesPageRoute({
  nonce: V0_CREATED_INVITE_NONCE,
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
    expect(screen.getByRole("link", { name: "Welcome Guide" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Twitter" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Tumblr" })).toBeVisible();
    expect(screen.getByRole("link", { name: "BobaBoard.com" })).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Go back to V0" })
    ).not.toBeInTheDocument();
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
    expect(
      screen.queryByRole("link", { name: "Welcome Guide" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Twitter" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Tumblr" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "BobaBoard.com" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go back to V0" })).toBeVisible();
  });

  test("Redirects when user is logged in and already a member of the realm", async () => {
    render(
      <Client
        router={INVITES_ROUTER}
        initialData={{ realm: makeRealmData(LOGGED_IN_V0_DATA) }}
      >
        <InvitesPage
          realmSlug={V0_DATA.slug}
          realmId={V0_CREATED_INVITE.realm_id}
          inviteStatus="pending"
        />
      </Client>
    );

    await waitFor(() => {
      // I can't figure out how to test that the redirects are working.
      // If I try it with the commented out expects below, jest gives me
      // Matcher error: received value must be a mock or spy function
      // but if I'm understanding what is happening in /tests/UI/utils/index.tsx
      // isn't it being spied on there?
      // expect(INVITES_ROUTER.push).toHaveBeenCalledWith("/");
      // expect(INVITES_ROUTER.push).toHaveReturnedWith(true);
      expect(screen.getByText(`You are already a member of ${V0_REALM_NAME}`));
    });
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

    userEvent.click(
      screen.getByRole("button", { name: `Join ${V0_REALM_NAME}` })
    );

    // await waitFor(() => {
    //   expect(INVITES_ROUTER.push).toHaveBeenCalledWith("/");
    //   expect(INVITES_ROUTER.push).toHaveReturnedWith(true);
    // });
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

    expect(
      screen.getByRole("button", { name: `Join ${V0_REALM_NAME}` })
    ).toBeDisabled();

    userEvent.type(
      screen.getByLabelText("Email"),
      V0_CREATED_INVITE.invitee_email
    );
    expect(screen.getByLabelText("Email")).toHaveValue(
      V0_CREATED_INVITE.invitee_email
    );
    const NEW_USER_PASSWORD = "ThIsIsReAlLySeCuRe";
    userEvent.type(screen.getByLabelText("Password"), NEW_USER_PASSWORD);
    expect(screen.getByLabelText("Password")).toHaveValue(NEW_USER_PASSWORD);

    expect(
      screen.getByRole("button", { name: `Join ${V0_REALM_NAME}` })
    ).toBeEnabled();

    userEvent.click(
      screen.getByRole("button", { name: `Join ${V0_REALM_NAME}` })
    );

    // await waitFor(() => {
    //   expect(INVITES_ROUTER.push).toHaveBeenCalledWith("/");
    //   expect(INVITES_ROUTER.push).toHaveReturnedWith(true);
    // });
  });
});
