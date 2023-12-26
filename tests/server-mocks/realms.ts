import {
  LOGGED_IN_V0_MEMBER_DATA,
  V0_CREATED_INVITE,
  V0_CREATED_INVITE_NONCE,
  V0_CREATED_INVITE_NO_EMAIL,
  V0_CREATED_INVITE_NO_EMAIL_NONCE,
  V0_INVITES,
} from "./data/realm";

import { BOBATAN_NOTIFICATIONS_DATA } from "./data/user";
import debug from "debug";
import { http, HttpResponse } from "msw";
import { server } from ".";

const log = debug("bobafrontend:tests:server-mocks:realms");

export default [
  http.get("/realms/slug/v0", () => {
    log("fetching data for v0 realm");
    return HttpResponse.json(LOGGED_IN_V0_MEMBER_DATA);
  }),
  http.get(`/realms/${LOGGED_IN_V0_MEMBER_DATA.id}/notifications`, () => {
    log("fetching bobatan's notification data");
    return HttpResponse.json(BOBATAN_NOTIFICATIONS_DATA);
  }),
  http.get(`/realms/${LOGGED_IN_V0_MEMBER_DATA.id}/invites`, () => {
    log("fetching invites for twisted-minds realm");
    return HttpResponse.json(V0_INVITES);
  }),
  http.post(`/realms/${LOGGED_IN_V0_MEMBER_DATA.id}/invites`, () => {
    log("creating invite for twisted-minds realm");

    // Now include new invite when get all invites is called again
    server.use(
      http.get(`/realms/${LOGGED_IN_V0_MEMBER_DATA.id}/invites`, () => {
        log("fetching invites for twisted-minds realm with new invite");
        return HttpResponse.json({
          invites: [...V0_INVITES.invites, V0_CREATED_INVITE],
        });
      })
    );
    return HttpResponse.json({
      realm_id: V0_CREATED_INVITE.realm_id,
      invite_url: V0_CREATED_INVITE.invite_url,
    });
  }),
  http.get(
    `/realms/${LOGGED_IN_V0_MEMBER_DATA.id}/invites/${V0_CREATED_INVITE_NONCE}`,
    () => {
      log(
        `fetching invite status for invite with nonce ${V0_CREATED_INVITE_NONCE}`
      );
      return HttpResponse.json({
        realm_id: V0_CREATED_INVITE.realm_id,
        realm_slug: LOGGED_IN_V0_MEMBER_DATA.slug,
        invite_status: "pending",
      });
    }
  ),
  http.post(
    `/realms/${LOGGED_IN_V0_MEMBER_DATA.id}/invites/${V0_CREATED_INVITE_NONCE}`,
    () => {
      log(`accepting invite with nonce ${V0_CREATED_INVITE_NONCE}`);
      return HttpResponse.json({
        realm_id: V0_CREATED_INVITE.realm_id,
        realm_slug: LOGGED_IN_V0_MEMBER_DATA.slug,
      });
    }
  ),
  http.get(`/realms/${LOGGED_IN_V0_MEMBER_DATA.id}/notifications`, () => {
    log("fetching bobatan's notification data");
    return HttpResponse.json(BOBATAN_NOTIFICATIONS_DATA);
  }),
  http.get(
    `/realms/${LOGGED_IN_V0_MEMBER_DATA.id}/invites/${V0_CREATED_INVITE_NO_EMAIL_NONCE}`,
    () => {
      log(
        `fetching invite status for invite with nonce ${V0_CREATED_INVITE_NO_EMAIL_NONCE}`
      );
      return HttpResponse.json({
        realm_id: V0_CREATED_INVITE_NO_EMAIL.realm_id,
        realm_slug: LOGGED_IN_V0_MEMBER_DATA.slug,
        invite_status: "pending",
      });
    }
  ),
  http.post(
    `/realms/${LOGGED_IN_V0_MEMBER_DATA.id}/invites/${V0_CREATED_INVITE_NO_EMAIL_NONCE}`,
    () => {
      log(`accepting invite with nonce ${V0_CREATED_INVITE_NO_EMAIL_NONCE}`);
      return HttpResponse.json({
        realm_id: V0_CREATED_INVITE_NO_EMAIL.realm_id,
        realm_slug: LOGGED_IN_V0_MEMBER_DATA.slug,
      });
    }
  ),
];
