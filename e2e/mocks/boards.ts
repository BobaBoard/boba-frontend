import { rest } from "msw";

export default [
  rest.get("http://localhost:4200/realms/slug/v0/", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        slug: "v0",
        settings: {
          root: {
            cursor: {},
          },
          index_page: [],
          board_page: [],
          thread_page: [],
        },
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
      })
    );
  }),
];
