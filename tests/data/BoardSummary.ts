import { BoardSummary } from "types/Types";

// These exist on the server
export const GORE_BOARD_ID = "c6d3d10e-8e49-4d73-b28a-9d652b41beec";
export const ANIME_BOARD_ID = "4b30fb7c-2aca-4333-aa56-ae8623a92b65";
export const MAIN_STREET_BOARD_ID = "2fb151eb-c600-4fe4-a542-4662487e5496";
export const MUTED_BOARD_ID = "2bdce2fa-12e0-461b-b0fb-1a2e67227434";
export const RESTRICTED_BOARD_ID = "76ebaab0-6c3e-4d7b-900f-f450625a5ed3";
export const LONG_BOARD_ID = "db8dc5b3-5b4a-4bfe-a303-e176c9b00b83";

// These are just for these tests
export const RECNRAVE_BOARD_ID = "69cbb4f1-3297-4874-9f72-600d210e17ef";
export const KPOP_BOARD_ID = "4d98f676-4532-41c9-9f6c-1b12f40cb854";
export const DRAWN_BOARD_ID = "a98b7beb-157d-4952-8e75-b1d790999997";

export const GORE_SUMMARY: BoardSummary = {
  id: GORE_BOARD_ID,
  realmId: "v0",
  slug: "gore",
  avatarUrl:
    "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F6f71da44-8f28-4a2a-b795-e6e679032c23?alt=media&token=132c83dd-29d9-4828-abe2-9d260d759664",
  tagline: "Blood! Blood! Blood!",
  accentColor: "#7C0C0C",
  loggedInOnly: false,
  delisted: false,
};
export const RECNRAVE_SUMMARY: BoardSummary = {
  id: RECNRAVE_BOARD_ID,
  realmId: "v0",
  slug: "recnrave",
  avatarUrl:
    "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F8827f98c-9b90-4303-930c-e964640c90cc?alt=media&token=b9240022-f44f-4493-ac32-9358b3f9a2cd",
  tagline: "Recommend or rave about something. Anything. Everything.",
  accentColor: "#FD04C4",
  loggedInOnly: false,
  delisted: false,
};
export const KPOP_SUMMARY: BoardSummary = {
  id: KPOP_BOARD_ID,
  realmId: "v0",
  slug: "kpop",
  avatarUrl:
    "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2Fff79c9a1-e2fc-49d9-9200-3d01495226f4?alt=media&token=cae2cd71-1f56-4321-99b6-cd2e01bca6bf",
  tagline:
    "Who’s your bias and which maknae is kissing his hyung? Sksksk anyway stan Jungkook.",
  accentColor: "#3A0BDD",
  loggedInOnly: false,
  delisted: false,
};
export const ANIMANGA_SUMMARY: BoardSummary = {
  id: ANIME_BOARD_ID,
  realmId: "v0",
  slug: "animanga",
  avatarUrl:
    "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F4392058a-9ad6-411c-b76a-efa1a914d4a0?alt=media&token=5bb52a26-5e48-4668-805c-2ca11aa0a117",
  tagline:
    "When you can’t make it to the anime con, get your anime and manga fix right here.",
  accentColor: "#17BD3D",
  loggedInOnly: false,
  delisted: false,
  muted: false,
};
export const DRAWN_SUMMARY: BoardSummary = {
  id: DRAWN_BOARD_ID,
  realmId: "v0",
  slug: "drawn",
  avatarUrl:
    "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2Ff25b744c-c0a5-431e-9ed6-3abda37a0f58?alt=media&token=7144e14d-3e85-4c4d-ba70-05c16c67652f",
  tagline:
    "Drawn media on the screen or page that does not originate from Japan. Webcomics and webtoons, Sheith, favorite Marvel superheroes...take your pick.",
  accentColor: "#4091D4",
  loggedInOnly: false,
  delisted: false,
  muted: false,
};
