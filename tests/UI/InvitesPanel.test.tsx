import { Client, getAdminPanelRoute } from "./utils";
import {
  LOGGED_IN_V0_MEMBER_DATA,
  V0_CREATED_INVITE,
  V0_CREATED_INVITE_NO_EMAIL,
  V0_INVITES,
} from "../server-mocks/data/realm";
import { render, screen, waitFor, within } from "@testing-library/react";

import AdminPage from "pages/realms/admin/[[...panelId]]";
import React from "react";
import { RealmType } from "types/Types";
import debug from "debug";
import { format } from "date-fns";
import { makeRealmData } from "utils/client-data";
import { matchMedia } from "@shopify/jest-dom-mocks";
import { rest } from "msw";
import { server } from "../server-mocks";
import userEvent from "@testing-library/user-event";

const log = debug("bobafrontend:tests:UI:InvitesPanel");

const ADMIN_ROUTER = getAdminPanelRoute({
  adminPanel: "invite-form",
});

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/core/useIsChangingRoute");
jest.mock("utils/image-upload", () => ({
  ...jest.requireActual("utils/image-upload"),
  uploadImage: jest.fn(({ baseUrl, extension }) =>
    Promise.resolve(`${baseUrl}image${extension}`)
  ),
}));
describe("InvitesPanel", () => {
  test("renders create realm invite form", async () => {
    render(
      <Client
        router={ADMIN_ROUTER}
        initialData={{
          realm: makeRealmData(LOGGED_IN_V0_MEMBER_DATA) as RealmType,
        }}
      >
        <AdminPage />
      </Client>
    );

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(2);
    expect(headings[0]).toHaveTextContent("Create Realm Invite");
    expect(
      screen.getByRole("form", { name: "Create Realm Invite" })
    ).toBeVisible();
    expect(screen.getByLabelText("Email")).toBeVisible();
    expect(screen.getByLabelText("Label")).toBeVisible();
    expect(screen.getByRole("button", { name: "Create Invite" })).toBeVisible();
  });

  test("renders pending realm invites list as table", async () => {
    render(
      <Client
        router={ADMIN_ROUTER}
        initialData={{
          realm: makeRealmData(LOGGED_IN_V0_MEMBER_DATA) as RealmType,
        }}
      >
        <AdminPage />
      </Client>
    );

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(2);
    expect(headings[1]).toHaveTextContent("Pending Realm Invites");
    await waitFor(() => {
      const table = screen.getByRole("table", {
        name: "Pending Realm Invites",
      });
      expect(table).toBeVisible();
      expect(
        screen.queryByRole("list", { name: "Pending Realm Invites" })
      ).not.toBeInTheDocument();

      const invites = table.getElementsByTagName("tr");
      expect(invites).toHaveLength(V0_INVITES.invites.length + 1);
      Array.from(invites).forEach((row, i) => {
        if (i === 0) {
          expect(within(row).getByText("Created")).toBeVisible();
          expect(within(row).getByText("Expires")).toBeVisible();
          expect(within(row).getByText("Invite URL")).toBeVisible();
          expect(within(row).getByText("Email Locked")).toBeVisible();
          expect(within(row).getByText("Label")).toBeVisible();
          expect(within(row).getByText("Created By")).toBeVisible();
        } else {
          expect(
            within(row).getByText(
              format(
                new Date(V0_INVITES.invites[i - 1].issued_at),
                "MMM d, yyyy"
              )
            )
          ).toBeVisible();
          expect(
            within(row).getByText(
              format(
                new Date(V0_INVITES.invites[i - 1].expires_at),
                "MMM d, yyyy"
              )
            )
          ).toBeVisible();
          expect(
            within(row).getByDisplayValue(V0_INVITES.invites[i - 1].invite_url)
          ).toBeVisible();
          !V0_INVITES.invites[i - 1].invitee_email
            ? expect(within(row).getByDisplayValue("No")).toBeVisible()
            : V0_INVITES.invites[i - 1].own
            ? expect(
                within(row).getByDisplayValue(
                  V0_INVITES.invites[i - 1].invitee_email!
                )
              ).toBeVisible()
            : expect(within(row).getByDisplayValue("Yes")).toBeVisible();
          if (V0_INVITES.invites[i - 1].label) {
            expect(
              within(row).getByText(V0_INVITES.invites[i - 1].label!)
            ).toBeVisible();
          }
          V0_INVITES.invites[i - 1].own
            ? expect(within(row).getByText("You")).toBeVisible()
            : expect(within(row).getByText("Another Admin")).toBeVisible();
        }
      });
    });
  });

  test("renders pending realm invites list as list when screen is narrow", async () => {
    matchMedia.mock((mediaQuery: string) => {
      return { media: mediaQuery, matches: true };
    });

    render(
      <Client
        router={ADMIN_ROUTER}
        initialData={{
          realm: makeRealmData(LOGGED_IN_V0_MEMBER_DATA) as RealmType,
        }}
      >
        <AdminPage />
      </Client>
    );

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(2);
    expect(headings[1]).toHaveTextContent("Pending Realm Invites");
    await waitFor(() => {
      const invitesList = screen.getByRole("list", {
        name: "Pending Realm Invites",
      });
      expect(invitesList).toBeVisible();
      expect(
        screen.queryByRole("table", { name: "Pending Realm Invites" })
      ).not.toBeInTheDocument();

      const invites = within(invitesList).getAllByRole("list");
      expect(invites).toHaveLength(V0_INVITES.invites.length);
      invites.forEach((invite, i) => {
        expect(
          within(invite).getByText(
            format(new Date(V0_INVITES.invites[i].issued_at), "MMM d, yyyy")
          )
        ).toBeVisible();
        expect(
          within(invite).getByText(
            format(new Date(V0_INVITES.invites[i].expires_at), "MMM d, yyyy")
          )
        ).toBeVisible();
        expect(
          within(invite).getByDisplayValue(V0_INVITES.invites[i].invite_url)
        ).toBeVisible();
        !V0_INVITES.invites[i].invitee_email
          ? expect(within(invite).getByText("No")).toBeVisible()
          : V0_INVITES.invites[i].own
          ? expect(
              within(invite).getByText(V0_INVITES.invites[i].invitee_email!)
            ).toBeVisible()
          : expect(within(invite).getByText("Yes")).toBeVisible();
        if (V0_INVITES.invites[i].label) {
          expect(
            within(invite).getByText(V0_INVITES.invites[i].label!)
          ).toBeVisible();
        }
        V0_INVITES.invites[i].own
          ? expect(within(invite).getByText("You")).toBeVisible()
          : expect(within(invite).getByText("Another Admin")).toBeVisible();
      });
    });
    matchMedia.restore();
  });

  test("doesn't render pending realm invites list if empty", async () => {
    server.use(
      rest.get(
        `/realms/${LOGGED_IN_V0_MEMBER_DATA.id}/invites`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ invites: [] }));
        }
      )
    );
    render(
      <Client
        router={ADMIN_ROUTER}
        initialData={{
          realm: makeRealmData(LOGGED_IN_V0_MEMBER_DATA) as RealmType,
        }}
      >
        <AdminPage />
      </Client>
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("table", { name: "Pending Realm Invites" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("list", { name: "Pending Realm Invites" })
      ).not.toBeInTheDocument();
      expect(
        screen.getByText("There are no currently pending invites.")
      ).toBeVisible();
    });
  });

  test("creates new invite with email and label", async () => {
    render(
      <Client
        router={ADMIN_ROUTER}
        initialData={{
          realm: makeRealmData(LOGGED_IN_V0_MEMBER_DATA) as RealmType,
        }}
      >
        <AdminPage />
      </Client>
    );

    userEvent.type(
      screen.getByLabelText("Email"),
      V0_CREATED_INVITE.invitee_email
    );
    expect(screen.getByLabelText("Email")).toHaveValue(
      V0_CREATED_INVITE.invitee_email
    );

    userEvent.type(screen.getByLabelText("Label"), V0_CREATED_INVITE.label);
    expect(screen.getByLabelText("Label")).toHaveValue(V0_CREATED_INVITE.label);

    userEvent.click(screen.getByRole("button", { name: "Create Invite" }));
    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeVisible();
    });
    await waitFor(() => {
      expect(
        within(
          screen.getByRole("form", { name: "Create Realm Invite" })
        ).getByDisplayValue(V0_CREATED_INVITE.invite_url)
      ).toBeVisible();
    });
    await waitFor(() => {
      expect(
        within(
          screen.getByRole("table", { name: "Pending Realm Invites" })
        ).getByText(V0_CREATED_INVITE.label)
      ).toBeVisible();
      expect(
        within(
          screen.getByRole("table", { name: "Pending Realm Invites" })
        ).getByDisplayValue(V0_CREATED_INVITE.invite_url)
      ).toBeVisible();
      expect(
        within(
          screen.getByRole("table", { name: "Pending Realm Invites" })
        ).getByDisplayValue(V0_CREATED_INVITE.invitee_email)
      ).toBeVisible();
    });
  });

  test("creates new invite without email", async () => {
    server.use(
      rest.post<{
        email?: string;
        label?: string;
      }>(`/realms/${LOGGED_IN_V0_MEMBER_DATA.id}/invites`, (req, res, ctx) => {
        log("creating invite for twisted-minds realm");

        // Now include new invite when get all invites is called again
        server.use(
          rest.get(
            `/realms/${LOGGED_IN_V0_MEMBER_DATA.id}/invites`,
            (_, res, ctx) => {
              log("fetching invites for twisted-minds realm with new invite");
              return res.once(
                ctx.status(200),
                ctx.json({
                  invites: [...V0_INVITES.invites, V0_CREATED_INVITE_NO_EMAIL],
                })
              );
            }
          )
        );
        return res.once(
          ctx.status(200),
          ctx.json({
            realm_id: V0_CREATED_INVITE_NO_EMAIL.realm_id,
            invite_url: V0_CREATED_INVITE_NO_EMAIL.invite_url,
          })
        );
      })
    );
    render(
      <Client
        router={ADMIN_ROUTER}
        initialData={{
          realm: makeRealmData(LOGGED_IN_V0_MEMBER_DATA) as RealmType,
        }}
      >
        <AdminPage />
      </Client>
    );

    expect(screen.getByLabelText("Email")).toHaveValue("");

    userEvent.type(
      screen.getByLabelText("Label"),
      V0_CREATED_INVITE_NO_EMAIL.label
    );
    expect(screen.getByLabelText("Label")).toHaveValue(
      V0_CREATED_INVITE_NO_EMAIL.label
    );

    userEvent.click(screen.getByRole("button", { name: "Create Invite" }));
    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeVisible();
    });
    await waitFor(() => {
      expect(
        within(
          screen.getByRole("form", { name: "Create Realm Invite" })
        ).getByDisplayValue(V0_CREATED_INVITE_NO_EMAIL.invite_url)
      ).toBeVisible();
    });
    await waitFor(() => {
      expect(
        within(
          screen.getByRole("table", { name: "Pending Realm Invites" })
        ).getByText(V0_CREATED_INVITE_NO_EMAIL.label)
      ).toBeVisible();
      expect(
        within(
          screen.getByRole("table", { name: "Pending Realm Invites" })
        ).getByDisplayValue(V0_CREATED_INVITE_NO_EMAIL.invite_url)
      ).toBeVisible();
    });
  });
});
