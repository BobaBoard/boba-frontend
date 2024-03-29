import { RealmPermissions } from "types/Types";

export const V0_DATA = {
  id: "v0-fake-id",
  slug: "v0",
  settings: {
    root: {
      cursor: {},
    },
    index_page: [],
    board_page: [],
    thread_page: [],
  },
  homepage: {
    blocks: [],
  },
  realm_permissions: [],
  boards: [
    {
      id: "2fb151eb-c600-4fe4-a542-4662487e5496",
      realm_id: "v0-fake-id",
      slug: "main_street",
      tagline: "For BobaBoard-related discussions.",
      avatar_url: "/villains.png",
      accent_color: "#ff5252",
      delisted: false,
      logged_in_only: false,
    },
    {
      id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
      realm_id: "v0-fake-id",
      slug: "gore",
      tagline: "Blood! Blood! Blood!",
      avatar_url: "/gore.png",
      accent_color: "#f96680",
      delisted: false,
      logged_in_only: false,
    },
    {
      id: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
      realm_id: "v0-fake-id",
      slug: "anime",
      tagline: "I wish I had a funny one for this.",
      avatar_url: "/anime.png",
      accent_color: "#24d282",
      delisted: false,
      logged_in_only: false,
    },
    {
      id: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
      realm_id: "v0-fake-id",
      slug: "long",
      tagline: "A board to test with many posts.",
      avatar_url: "/onceler-board.png",
      accent_color: "#00b8ff",
      delisted: false,
      logged_in_only: false,
    },
    {
      id: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
      realm_id: "v0-fake-id",
      slug: "memes",
      tagline: "A board to test collections view.",
      avatar_url: "/kink-meme.png",
      accent_color: "#7b00ff",
      delisted: false,
      logged_in_only: false,
    },
    {
      id: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
      realm_id: "v0-fake-id",
      slug: "muted",
      tagline: "A board to test for muting.",
      avatar_url:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Feded338a-e0e5-4a97-a368-5ae525c0eec4?alt=media&token=914f84b7-a581-430e-bb09-695f653e8e02",
      accent_color: "#9b433b",
      delisted: false,
      logged_in_only: false,
    },
    {
      id: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
      realm_id: "v0-fake-id",
      slug: "restricted",
      tagline: "A board to test for logged-in only view",
      avatar_url:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd",
      accent_color: "#234a69",
      delisted: false,
      logged_in_only: true,
    },
  ],
};

export const LOGGED_IN_V0_MEMBER_DATA = {
  slug: "v0",
  id: "v0-fake-id",
  settings: {
    root: {
      cursor: {},
    },
    index_page: [],
    board_page: [],
    thread_page: [],
  },
  homepage: {
    blocks: [],
  },
  realm_permissions: [
    RealmPermissions.CREATE_REALM_INVITE,
    RealmPermissions.ACCESS_LOCKED_BOARDS_ON_REALM,
    RealmPermissions.COMMENT_ON_REALM,
    RealmPermissions.CREATE_THREAD_ON_REALM,
    RealmPermissions.POST_ON_REALM,
  ],
  boards: [
    {
      id: "2fb151eb-c600-4fe4-a542-4662487e5496",
      realm_id: "v0-fake-id",
      slug: "main_street",
      tagline: "For BobaBoard-related discussions.",
      avatar_url: "/villains.png",
      accent_color: "#ff5252",
      delisted: false,
      logged_in_only: false,
      muted: false,
      pinned: false,
    },
    {
      id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
      realm_id: "v0-fake-id",
      slug: "gore",
      tagline: "Blood! Blood! Blood!",
      avatar_url: "/gore.png",
      accent_color: "#f96680",
      delisted: false,
      logged_in_only: false,
      muted: false,
      pinned: true,
    },
    {
      id: "4b30fb7c-2aca-4333-aa56-ae8623a92b65",
      realm_id: "v0-fake-id",
      slug: "anime",
      tagline: "I wish I had a funny one for this.",
      avatar_url: "/anime.png",
      accent_color: "#24d282",
      delisted: false,
      logged_in_only: false,
      muted: false,
      pinned: false,
    },
    {
      id: "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83",
      realm_id: "v0-fake-id",
      slug: "long",
      tagline: "A board to test with many posts.",
      avatar_url: "/onceler-board.png",
      accent_color: "#00b8ff",
      delisted: false,
      logged_in_only: false,
      muted: false,
      pinned: false,
    },
    {
      id: "0e0d1ee6-f996-4415-89c1-c9dc1fe991dc",
      realm_id: "v0-fake-id",
      slug: "memes",
      tagline: "A board to test collections view.",
      avatar_url: "/kink-meme.png",
      accent_color: "#7b00ff",
      delisted: false,
      logged_in_only: false,
      muted: false,
      pinned: false,
    },
    {
      id: "2bdce2fa-12e0-461b-b0fb-1a2e67227434",
      realm_id: "v0-fake-id",
      slug: "muted",
      tagline: "A board to test for muting.",
      avatar_url:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Feded338a-e0e5-4a97-a368-5ae525c0eec4?alt=media&token=914f84b7-a581-430e-bb09-695f653e8e02",
      accent_color: "#9b433b",
      delisted: false,
      logged_in_only: false,
      muted: true,
      pinned: false,
    },
    {
      id: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
      realm_id: "v0-fake-id",
      slug: "restricted",
      tagline: "A board to test for logged-in only view",
      avatar_url:
        "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd",
      accent_color: "#234a69",
      delisted: false,
      logged_in_only: true,
    },
  ],
};

export const LOGGED_IN_V0_NONMEMBER_DATA = {
  ...LOGGED_IN_V0_MEMBER_DATA,
  realm_permissions: [],
}

export const V0_INVITES = {
  invites: [
    {
      realm_id: LOGGED_IN_V0_MEMBER_DATA.id,
      invite_url: `https://v0.boba.social/invites/123invite_code456`,
      invitee_email: "ms.boba@bobaboard.com",
      own: false,
      issued_at: "2021-06-09T04:20:00Z",
      expires_at: "2021-06-10T16:20:00Z",
      label: "This is a test invite.",
    },
    {
      realm_id: LOGGED_IN_V0_MEMBER_DATA.id,
      invite_url: "https://v0.boba.social/invites/456invite_code789",
      invitee_email: "nolabels@bobaboard.com",
      own: true,
      issued_at: "2021-06-09T04:20:00Z",
      expires_at: "2021-06-10T16:20:00Z",
    },
    {
      realm_id: LOGGED_IN_V0_MEMBER_DATA.id,
      invite_url: "https://v0.boba.social/invites/789invite_code456",
      invitee_email: "someone.else@bobaboard.com",
      own: true,
      issued_at: "2021-06-09T04:20:00Z",
      expires_at: "2021-06-10T16:20:00Z",
      label: "This is test invite 3",
    },
    {
      realm_id: LOGGED_IN_V0_MEMBER_DATA.id,
      invite_url: "https://v0.boba.social/invites/456invite_code321",
      own: true,
      issued_at: "2021-06-09T04:20:00Z",
      expires_at: "2021-06-10T16:20:00Z",
      label: "This invite is not locked to an email",
    },
  ],
};

export const V0_CREATED_INVITE_NONCE = "QRSnew_invite_codeXYZ";
export const V0_CREATED_INVITE = {
  realm_id: LOGGED_IN_V0_MEMBER_DATA.id,
  invite_url: `https://v0.boba.social/invites/${V0_CREATED_INVITE_NONCE}`,
  invitee_email: "new.person@bobaboard.com",
  own: true,
  issued_at: "2021-07-09T04:20:00Z",
  expires_at: "2021-07-09T16:20:00Z",
  label: "Newly created invite",
};

export const V0_CREATED_INVITE_NO_EMAIL_NONCE = "ABCnew_invite_codeDEF";
export const V0_CREATED_INVITE_NO_EMAIL = {
  realm_id: LOGGED_IN_V0_MEMBER_DATA.id,
  invite_url: `https://v0.boba.social/invites/${V0_CREATED_INVITE_NO_EMAIL_NONCE}`,
  own: true,
  issued_at: "2021-07-09T04:20:00Z",
  expires_at: "2021-07-10T16:20:00Z",
  label: "Newly created invite (no email)",
};
