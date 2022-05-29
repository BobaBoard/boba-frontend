import { LOGGED_IN_V0_DATA, V0_CREATED_INVITE, V0_INVITES } from "./data/realm";

import debug from "debug";
import { rest } from "msw";
import { server } from ".";

const log = debug("bobafrontend:tests:server-mocks:realms");

export default [
  rest.get("/realms/slug/v0", (req, res, ctx) => {
    log("fetching data for v0 realm");
    return res(ctx.status(200), ctx.json(LOGGED_IN_V0_DATA));
  }),
  rest.get(`/realms/${LOGGED_IN_V0_DATA.id}/invites`, (req, res, ctx) => {
    log("fetching invites for twisted-minds realm");
    return res(ctx.status(200), ctx.json(V0_INVITES));
  }),
  rest.post<{
    email: string;
    label?: string;
  }>(`/realms/${LOGGED_IN_V0_DATA.id}/invites`, (req, res, ctx) => {
    log("creating invite for twisted-minds realm");
    if (!req.body?.email) {
      log("invalid request body");
      throw new Error("invalid request");
    }

    // Now include new invite when get all invites is called again
    server.use(
      rest.get(`/realms/${LOGGED_IN_V0_DATA.id}/invites`, (_, res, ctx) => {
        log("fetching invites for twisted-minds realm with new invite");
        return res(
          ctx.status(200),
          ctx.json({
            invites: [...V0_INVITES.invites, V0_CREATED_INVITE],
          })
        );
      })
    );
    return res(
      ctx.status(200),
      ctx.json({
        realm_id: V0_CREATED_INVITE.realm_id,
        invite_url: V0_CREATED_INVITE.invite_url,
      })
    );
  }),
  rest.get(
    `/realms/${LOGGED_IN_V0_DATA.id}/invites/QRSnew_invite_codeXYZ`,
    (req, res, ctx) => {
      log("fetching invite status for invite with nonce QRSnew_invite_codeXYZ");
      return res(
        ctx.status(200),
        ctx.json({
          realm_id: V0_CREATED_INVITE.realm_id,
          realm_slug: LOGGED_IN_V0_DATA.slug,
          invite_status: "pending",
        })
      );
    }
  ),
  rest.post<{
    email?: string;
    password?: string;
  }>(
    `/realms/${LOGGED_IN_V0_DATA.id}/invites/QRSnew_invite_codeXYZ`,
    (req, res, ctx) => {
      log("accepting invite with nonce QRSnew_invite_codeXYZ");
      return res(
        ctx.status(200),
        ctx.json({
          realm_id: V0_CREATED_INVITE.realm_id,
          realm_slug: LOGGED_IN_V0_DATA.slug,
        })
      );
    }
  ),
];
