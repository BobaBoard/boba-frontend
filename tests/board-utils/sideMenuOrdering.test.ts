import { expect, test } from "@jest/globals";

import { BoardSummary } from "../../types/Types";
import { processBoardsUpdates } from "../../utils/boards-utils";

const BOARDS_INITIAL_DATA: BoardSummary[] = [
  {
    id: "gore",
    realmId: "v0",
    slug: "gore",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F6f71da44-8f28-4a2a-b795-e6e679032c23?alt=media&token=132c83dd-29d9-4828-abe2-9d260d759664",
    tagline: "Blood! Blood! Blood!",
    accentColor: "#7C0C0C",
    loggedInOnly: false,
    delisted: false,
  },
  {
    id: "recnrave",
    realmId: "v0",
    slug: "recnrave",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F8827f98c-9b90-4303-930c-e964640c90cc?alt=media&token=b9240022-f44f-4493-ac32-9358b3f9a2cd",
    tagline: "Recommend or rave about something. Anything. Everything.",
    accentColor: "#FD04C4",
    loggedInOnly: false,
    delisted: false,
  },
  {
    id: "kpop",
    realmId: "v0",
    slug: "kpop",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2Fff79c9a1-e2fc-49d9-9200-3d01495226f4?alt=media&token=cae2cd71-1f56-4321-99b6-cd2e01bca6bf",
    tagline:
      "Who’s your bias and which maknae is kissing his hyung? Sksksk anyway stan Jungkook.",
    accentColor: "#3A0BDD",
    loggedInOnly: false,
    delisted: false,
  },
  {
    id: "animanga",
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
  },
  {
    id: "drawn",
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
  },
  {
    id: "kinkmeme",
    realmId: "v0",
    slug: "kinkmeme",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F20d9c444-216c-4570-9232-6306f5184b31?alt=media&token=6d480c49-335d-4832-99e7-add1c629d66b",
    tagline: "The way to friendship is through hardcore pornography.",
    accentColor: "#000000",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "literature",
    realmId: "v0",
    slug: "literature",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2Fb9461483-c640-4d3f-b899-544b721652bc?alt=media&token=d961bd31-58a9-4ad0-8be3-ce10d1d6302d",
    tagline:
      "The written word, from English-language queer and YA lit, to Chinese danmei, Shakespearean classics, and everything in between. ",
    accentColor: "#AB3D06",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "liveaction",
    realmId: "v0",
    slug: "liveaction",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F76663dc4-1980-43d8-933e-be635494a274?alt=media&token=d46e2fb7-30e9-4dd4-b169-cdfd5f35d858",
    tagline:
      "What are we Netflix-and-chilling with tonight? Any screen media with real human actors goes here!",
    accentColor: "#0435FD",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "askboba",
    realmId: "v0",
    slug: "askboba",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F42163f49-4e87-4918-88d5-2eec60386f6e?alt=media&token=fab7db0c-90bf-48dd-b766-e91f68dd760b",
    tagline:
      "Got an interesting inquiry about life, the universe, and everything? Askreddit-style discussion board for deep and not-so-deep thoughts.",
    accentColor: "#FFC300",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "steamy",
    realmId: "v0",
    slug: "steamy",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F47adffaa-ed30-4db5-950d-efef57bd57ff?alt=media&token=dcf5211c-4077-476e-aa87-f47f5ba5529a",
    tagline:
      "Is it hot? Is it wet? Does it steam up the room? Put that moistness here.",
    accentColor: "#ff9d9c",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "gaming",
    realmId: "v0",
    slug: "gaming",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F32df4ce7-377d-4b16-a70b-1e5f533edf06?alt=media&token=96913bfd-6070-42a0-8e23-1f36b8b3147f",
    tagline:
      "From Tetris to Animal Crossing, Luigi to Solid Snake, it all goes here.",
    accentColor: "#178f32",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "monsterfucking",
    realmId: "v0",
    slug: "monsterfucking",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F9198fe8a-18a4-4778-9f97-83962543c618?alt=media&token=9ec62008-8776-434f-b6ec-8bdf381e52bd",
    tagline: "Because only a fool makes a monster you can't fuck.",
    accentColor: "#6f0000",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "nightblogging",
    realmId: "v0",
    slug: "nightblogging",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F45dfc3c4-f52f-4d4a-a77f-570c58c6f295?alt=media&token=4d8e7f5b-4540-491e-9187-75e371d42986",
    tagline:
      "Random unformed thoughts flashing through your heads? Want to chat without goal or purpose? All welcome here. Open 24/7.",
    accentColor: "#d6d600",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "miscellaneous",
    realmId: "v0",
    slug: "miscellaneous",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F3e69bfbf-2a41-4869-979f-b00d2e0f870c?alt=media&token=d2660a43-e0cc-44c3-9899-5064ecd79e6b",
    tagline: "Can't find the right board? Just dump it here.",
    accentColor: "#a28be2",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "crack",
    realmId: "v0",
    slug: "crack",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F1e0fa066-ecbc-4830-a402-c7e56227e0ab?alt=media&token=ef8c3bbb-36f7-4b39-875a-fd13840dad2b",
    tagline:
      "Give us your shitposts, your crossovers, your open RPs transcending reason.",
    accentColor: "#1c75ff",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "thirst",
    realmId: "v0",
    slug: "thirst",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F49b590c3-608a-4394-8cac-3d01142a9bc4?alt=media&token=66bcb44e-4f71-405e-87cc-f5f5edb03883",
    tagline: "Quench your thirst. Stay hydrated. Chat around the water cooler.",
    accentColor: "#b00ba8",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "salt",
    realmId: "v0",
    slug: "salt",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F68f82a32-6f78-4e3f-9b11-d6bd2bf56329?alt=media&token=a3c72fb2-f594-471e-869f-f5546440913d",
    tagline:
      "Since ancient times, one of the most sought-after minerals in the world. Fandom, not-fandom, and Himalayan are all welcome.",
    accentColor: "#b4d2e9",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "bobaland",
    realmId: "v0",
    slug: "bobaland",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fmain_street%2F513d9e47-ea9d-4be3-9903-fbe7a346011a?alt=media&token=964ca787-d2dd-4dbf-8deb-d4aa980364a5",
    tagline:
      "Bugs, feature requests, impressions, tests, shitposts, and everything else related to BobaBoard.\n",
    accentColor: "#ff0f4b",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "aww",
    realmId: "v0",
    slug: "aww",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F7a4c4b8c-dce4-49ad-b292-f799473fbcd6?alt=media&token=f0aa1b5a-80ba-4c32-8bc3-5aa5633cf4e4",
    tagline: "2020 getting you down? Here, have the antidote!",
    accentColor: "#ffc7f8",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "matrix",
    realmId: "v0",
    slug: "matrix",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F2b848741-5378-4c0f-a910-7288df6bf1f7?alt=media&token=74155820-a10c-49f6-ba1d-8e2ced9572ab",
    tagline:
      "We live in a society. Let's discuss it (and other real life stuff).",
    accentColor: "#d21a16",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "outerweb",
    realmId: "v0",
    slug: "outerweb",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Ff19900da-a724-492d-91d1-dca27f43bd23?alt=media&token=311710c0-7168-489b-8339-238021c98e10",
    tagline:
      "Found something snazzy on the web? Is Tumblr on sale again? Get the latest from the series of tubes.",
    accentColor: "#551A8B",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "aesthetic",
    realmId: "v0",
    slug: "aesthetic",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F04073c65-0a7b-4236-9297-203a122a0e0c?alt=media&token=e36dcc79-00c5-450a-81f6-0b045b1665ee",
    tagline:
      "What's it going to be? Your vaporwave, or your deep fried memes? Your pastelcore, or your mid-2000s emo-goth?",
    accentColor: "#ebc738",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "furry",
    realmId: "v0",
    slug: "furry",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F1b1b09a9-d622-4ec1-9cc8-5a6f2f32153b?alt=media&token=473b4366-5adb-4d0a-ad44-f99a2abc9bbc",
    tagline: "*notices new board* OwO whats this...?",
    accentColor: "#ff5252",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "liveblogging",
    realmId: "v0",
    slug: "liveblogging",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Fff601496-077f-4e0b-a6a2-1ab0c30c1d79?alt=media&token=e5fc98fe-8412-444e-8796-d04f0e0d81d2",
    tagline:
      "Whether it's a multiseason binge you've put off forever or a spur-of-the moment commentary on your intensive shitposting masterclass, we're here to listen.",
    accentColor: "#40e0d0",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "cons",
    realmId: "v0",
    slug: "cons",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F3ca2b077-f382-4337-b9ec-be57a50aac8e?alt=media&token=2112efec-2db8-449a-b648-0a7d5e074395",
    tagline:
      "Conventions, past and present. Glomping will be persecuted to the full extent of the law. Please no sharpie baths.",
    accentColor: "#ce769c",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "spoopy",
    realmId: "v0",
    slug: "spoopy",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Feded338a-e0e5-4a97-a368-5ae525c0eec4?alt=media&token=914f84b7-a581-430e-bb09-695f653e8e02",
    tagline: "man door hand hook car door",
    accentColor: "#9b433b",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "brains",
    realmId: "v0",
    slug: "brains",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Fdd58d97b-85d8-4111-a76d-303b76ea38f6?alt=media&token=f6e4df8e-60f4-4519-ba4a-ec5c451e97eb",
    tagline:
      "Good brain days, bad brain days, meh brain days. This board is here for you. <3",
    accentColor: "#19a4e6",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "deaddove",
    realmId: "v0",
    slug: "deaddove",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F2a1174c5-ce89-441d-92b0-e64b838318bd?alt=media&token=8d7b9c21-fc40-48ea-a3b6-6bf0e4d49e8d",
    tagline: "Literally what it says on the bag.",
    accentColor: "#eb0033",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "musicals",
    realmId: "v0",
    slug: "musicals",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F50f46948-fc44-4b52-a62e-15d7c8a91195?alt=media&token=0cf4a7db-2d54-4538-bb26-f0c02f018d7a",
    tagline: "Jesus Christ the Demon Barber of the Opera (& Cats™️)",
    accentColor: "#de2e90",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "oldschool",
    realmId: "v0",
    slug: "oldschool",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Fc3b86805-4df7-4b1a-9fa2-b96b5165a636?alt=media&token=7652d44a-38cb-40cc-82ef-908cd4265840",
    tagline:
      "(shakes fists) kids these days don't appreciate the good content of my heydays",
    accentColor: "#fa8628",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "original",
    realmId: "v0",
    slug: "original",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F8288ce63-3804-48d0-8bad-f3df0fca6f01?alt=media&token=d846485e-1b84-47ef-b86c-ee23d6230363",
    tagline: "Give us the OG: the AUs, the OCs, and the PWPs",
    accentColor: "#1e825f",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "wips",
    realmId: "v0",
    slug: "wips",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Faaf42068-bcee-4db0-9dc7-cb560cb099c9?alt=media&token=b8d44a0b-64d3-4dfb-865b-e31a1bea5967",
    tagline:
      "Show us what you're working on, encourage others' projects, and [idk something motivational??]",
    accentColor: "#ceb714",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "wishlist",
    realmId: "v0",
    slug: "wishlist",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2Ff73e7212-87a4-461d-92b9-035869878f0a?alt=media&token=61d9f783-e7b3-40b8-af5f-af1181a9d7d4",
    tagline: "🌟When you wish upon a website🌟",
    accentColor: "#d263ba",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "challenge",
    realmId: "v0",
    slug: "challenge",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2Fc1714093-6024-42b6-8a8f-a629e9e17452?alt=media&token=17796b89-5912-42f9-999e-aa071aa4fbe0",
    tagline:
      "Whether it's 50K a month or a drawing a day, let the #cheersquad bring you to completion.",
    accentColor: "#82074d",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "bookclub",
    realmId: "v0",
    slug: "bookclub",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2F934a088a-6489-4a63-a58b-cb13645a9d7c?alt=media&token=33d2abe1-c056-431d-8091-696df438f82f",
    tagline:
      "Boba's Inaugural Bookclub is currently reading Scum Villain!! Week Three (Oct 26-Nov 1): ch 21-30",
    accentColor: "#00aa92",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
  {
    id: "h4x0rz",
    realmId: "v0",
    slug: "h4x0rz",
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2Fc94e298f-d3f2-4f5c-bd1d-c6c6f765f98c?alt=media&token=5ac2d5e4-c5fd-4500-9699-d1d00c94f6cd",
    tagline: "Boba'); DROP TABLE Boards;--",
    accentColor: "#00ff41",
    loggedInOnly: false,
    delisted: false,
    muted: false,
  },
];

const notifications = {
  aesthetic: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-10-29T01:17:26.096Z"),
  },
  animanga: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-10-30T04:56:56.608Z"),
  },
  askboba: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-10-16T15:31:17.992Z"),
  },
  aww: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T20:14:25.893Z"),
  },
  bobaland: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T05:51:19.936Z"),
  },
  bookclub: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T20:10:30.535Z"),
  },
  brains: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-01T19:22:35.275Z"),
  },
  challenge: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T07:36:17.724Z"),
  },
  cons: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T22:00:42.755Z"),
  },
  crack: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-01T20:11:19.543Z"),
  },
  deaddove: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-01T18:20:06.315Z"),
  },
  drawn: {
    hasNotifications: true,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T05:51:19.936Z"),
  },
  furry: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T19:16:35.902Z"),
  },
  gaming: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T20:20:04.168Z"),
  },
  gore: {
    hasNotifications: true,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-10-29T01:17:26.096Z"),
  },
  h4x0rz: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T01:36:09.164Z"),
  },
  kinkmeme: {
    hasNotifications: true,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T20:10:30.535Z"),
  },
  kpop: {
    hasNotifications: true,
    notificationsOutdated: true,
    lastUpdateFromOthersAt: new Date("2020-10-16T15:31:17.992Z"),
  },
  literature: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T08:43:38.776Z"),
  },
  liveaction: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-01T14:52:22.313Z"),
  },
  liveblogging: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-10-31T15:03:58.767Z"),
  },
  matrix: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T19:49:32.835Z"),
  },
  miscellaneous: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-01T15:59:19.662Z"),
  },
  monsterfucking: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-01T10:25:32.700Z"),
  },
  musicals: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-10-29T21:22:39.958Z"),
  },
  nightblogging: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T01:08:30.838Z"),
  },
  oldschool: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T20:07:35.970Z"),
  },
  original: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T07:38:33.489Z"),
  },
  outerweb: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-10-29T02:22:53.099Z"),
  },
  recnrave: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-01T05:57:46.156Z"),
  },
  salt: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T19:25:06.216Z"),
  },
  spoopy: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-10-30T23:27:52.757Z"),
  },
  steamy: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-10-31T08:02:54.697Z"),
  },
  thirst: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T18:08:20.783Z"),
  },
  wips: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T20:18:05.760Z"),
  },
  wishlist: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: new Date("2020-11-02T07:22:36.122Z"),
  },
  main_street: {
    hasNotifications: false,
    notificationsOutdated: false,
    lastUpdateFromOthersAt: null,
  },
};

test("Check boards displayed in alphabetical order", () => {
  const { allBoards } = processBoardsUpdates({
    boardsData: BOARDS_INITIAL_DATA,
    boardsNotifications: notifications,
    boardsFilter: "",
    isLoggedIn: true,
  });
  expect(allBoards.map((board: { slug: string }) => board.slug)).toStrictEqual([
    "aesthetic",
    "animanga",
    "askboba",
    "aww",
    "bobaland",
    "bookclub",
    "brains",
    "challenge",
    "cons",
    "crack",
    "deaddove",
    "drawn",
    "furry",
    "gaming",
    "gore",
    "h4x0rz",
    "kinkmeme",
    "kpop",
    "literature",
    "liveaction",
    "liveblogging",
    "matrix",
    "miscellaneous",
    "monsterfucking",
    "musicals",
    "nightblogging",
    "oldschool",
    "original",
    "outerweb",
    "recnrave",
    "salt",
    "spoopy",
    "steamy",
    "thirst",
    "wips",
    "wishlist",
  ]);
});

test("Check recent boards recent order", () => {
  const { recentBoards } = processBoardsUpdates({
    boardsData: BOARDS_INITIAL_DATA,
    boardsNotifications: notifications,
    boardsFilter: "",
    isLoggedIn: true,
  });

  // NOTE: Recent boards are in reverse chronological order, as this is
  // how they're displayed.
  expect(
    recentBoards.map((board: { slug: string }) => board.slug)
  ).toStrictEqual([
    "kinkmeme", // "2020-11-02T20:10:30.535Z"
    "drawn", // "2020-11-02T05:51:19.936Z"
    "gore", // "2020-10-29T01:17:26.096Z"
    "kpop", // "2020-10-16T15:31:17.992Z"
  ]);
});

// test("Check pinned boards order", () => {
//   const { pinnedBoards } = processBoardsUpdates(BOARDS_INITIAL_DATA, "", true);

//   expect(
//     pinnedBoards.map((board: { slug: string }) => board.slug)
//   ).toStrictEqual(["crack", "kpop", "bobaland", "steamy", "askboba"]);
// });

test("Check boards with filter", () => {
  const { recentBoards, allBoards } = processBoardsUpdates({
    boardsData: BOARDS_INITIAL_DATA,
    boardsNotifications: notifications,
    boardsFilter: "kp",
    isLoggedIn: true,
  });
  expect(
    recentBoards.map((board: { slug: string }) => board.slug)
  ).toStrictEqual(["kpop"]);

  expect(allBoards.map((board: { slug: string }) => board.slug)).toStrictEqual([
    "kpop",
  ]);
});
