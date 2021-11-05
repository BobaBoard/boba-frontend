import { rest } from "msw";

export default [
  rest.get(
    "http://localhost:4200/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec",
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          realm_id: "f377afb3-5c62-40cc-8f07-1f4749a780eb",
          slug: "gore",
          tagline: "Blood! Blood! Blood!",
          avatar_url: "/gore.png",
          accent_color: "#f96680",
          delisted: false,
          logged_in_only: false,
          descriptions: [
            {
              id: "f377afb3-5c62-40cc-8f07-1f4749a780eb",
              type: "category_filter",
              index: 2,
              title: "Gore Categories",
              categories: ["blood", "bruises"],
              description: null,
            },
            {
              id: "f377afb3-5c62-40cc-8f07-1f4749a780eb",
              type: "text",
              index: 1,
              title: "Gore description",
              categories: null,
              description: '[{"insert": "pls b nice"}]',
            },
          ],
        })
      );
    }
  ),
  rest.get(
    "http://localhost:4200/boards/76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: "76ebaab0-6c3e-4d7b-900f-f450625a5ed3",
          realm_id: "f377afb3-5c62-40cc-8f07-1f4749a780eb",
          slug: "restricted",
          tagline: "A board to test for logged-in only view",
          avatar_url:
            "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fgore%2Fe4e263cf-ee98-4902-9c14-c10299210e01.png?alt=media&token=7c170411-9401-4d4e-9f66-5d6dfee2fccd",
          accent_color: "#234a69",
          delisted: false,
          logged_in_only: true,
          descriptions: [],
        })
      );
    }
  ),
  rest.patch(
    "http://localhost:4200/boards/c6d3d10e-8e49-4d73-b28a-9d652b41beec",
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: "c6d3d10e-8e49-4d73-b28a-9d652b41beec",
          slug: "gore",
          avatar: "gore.png",
          descriptions: [
            {
              id: "68f77b6b-3ac9-40f2-8507-7fed90c0da82",
              type: "text",
              index: 3,
              title: "test2",
              categories: null,
              description: '[{"insert":"test\\n"}]',
            },
            {
              id: "id1",
              type: "category_filter",
              index: 2,
              title: "gore Categories",
              categories: ["blood", "bruises"],
              description: null,
            },
            {
              id: "id2",
              type: "text",
              index: 1,
              title: "gore description",
              categories: null,
              description: '[{"insert": "pls b nice"}]',
            },
          ],
          permissions: {
            board_permissions: ["edit_metadata"],
            post_permissions: ["edit_category_tags", "edit_content_notices"],
            thread_permissions: ["move_thread"],
          },
          posting_identities: [
            {
              id: "3df1d417-c36a-43dd-aaba-9590316ffc32",
              name: "The Owner",
              color: "pink",
              accessory:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F7c6c9459-7fa1-4d06-8dc0-ebb5b1bd76a8.png?alt=media&token=78d812a5-b217-4afb-99f3-41b9ed7b7ed5",
              avatar:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F2df7dfb4-4c64-4370-8e74-9ee30948f05d?alt=media&token=26b16bef-0fd2-47b5-b6df-6cf2799010ca",
            },
            {
              id: "e5f86f53-6dcd-4f15-b6ea-6ca1f088e62d",
              name: "GoreMaster5000",
              color: "red",
              accessory: null,
              avatar:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
            },
          ],
          accessories: [
            {
              id: 4,
              name: "Rolling",
              accessory: "/420accessories/weed_hands.png",
            },
            { id: 5, name: "Joint", accessory: "/420accessories/joint.png" },
          ],
        })
      );
    }
  ),
  rest.get("http://localhost:4200/feeds/boards/gore", (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        cursor: { next: null },
        activity: [
          {
            starter: {
              id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
              parent_thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
              parent_post_id: null,
              secret_identity: {
                name: "GoreMaster5000",
                avatar:
                  "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
                color: "red",
                accessory: null,
              },
              friend: false,
              created_at: "2020-09-25T05:42:00.00Z",
              content:
                '[{"insert":"Remember to be excellent to each other and only be mean to fictional characters!"}]',
              tags: {
                whisper_tags: ["An announcement from your headmaster!"],
                index_tags: [],
                category_tags: [],
                content_warnings: [],
              },
              total_comments_amount: 2,
              new_comments_amount: 0,
              new: false,
              own: false,
            },
            default_view: "thread",
            id: "8b2646af-2778-487e-8e44-7ae530c2549c",
            parent_board_slug: "gore",
            new_posts_amount: 0,
            new_comments_amount: 0,
            total_comments_amount: 2,
            total_posts_amount: 1,
            last_activity_at: "2020-10-04T05:44:00.00Z",
            direct_threads_amount: 0,
            muted: false,
            hidden: false,
            new: false,
          },
          {
            starter: {
              id: "11b85dac-e122-40e0-b09a-8829c5e0250e",
              parent_thread_id: "29d1b2da-3289-454a-9089-2ed47db4967b",
              parent_post_id: null,
              secret_identity: {
                name: "DragonFucker",
                avatar:
                  "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
                color: null,
                accessory:
                  "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fundefined%2F989f4b40-c1b8-4793-93dd-57e93df3e7ec.png?alt=media&token=cabdd8d5-b6a9-4914-bb59-eda4629f151b",
              },
              friend: false,
              created_at: "2020-04-30T03:23:00.00Z",
              content: '[{"insert":"Favorite character to maim?"}]',
              tags: {
                whisper_tags: [],
                index_tags: ["evil", "bobapost"],
                category_tags: ["bruises"],
                content_warnings: [],
              },
              total_comments_amount: 2,
              new_comments_amount: 0,
              new: false,
              own: false,
            },
            default_view: "thread",
            id: "29d1b2da-3289-454a-9089-2ed47db4967b",
            parent_board_slug: "gore",
            new_posts_amount: 0,
            new_comments_amount: 0,
            total_comments_amount: 2,
            total_posts_amount: 3,
            last_activity_at: "2020-05-23T05:52:00.00Z",
            direct_threads_amount: 2,
            muted: false,
            hidden: false,
            new: false,
          },
          {
            starter: {
              id: "3db477e0-57ed-491d-ba11-b3a0110b59b0",
              parent_thread_id: "a5c903df-35e8-43b2-a41a-208c43154671",
              parent_post_id: null,
              secret_identity: {
                name: "DragonFucker",
                avatar:
                  "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
                color: null,
                accessory: null,
              },
              friend: false,
              created_at: "2020-04-24T05:42:00.00Z",
              content: '[{"insert":"Favorite murder scene in videogames?"}]',
              tags: {
                whisper_tags: ["mwehehehehe"],
                index_tags: [],
                category_tags: ["blood", "bruises"],
                content_warnings: [],
              },
              total_comments_amount: 0,
              new_comments_amount: 0,
              new: false,
              own: false,
            },
            default_view: "thread",
            id: "a5c903df-35e8-43b2-a41a-208c43154671",
            parent_board_slug: "gore",
            new_posts_amount: 0,
            new_comments_amount: 0,
            total_comments_amount: 0,
            total_posts_amount: 3,
            last_activity_at: "2020-05-03T09:47:00.00Z",
            direct_threads_amount: 2,
            muted: false,
            hidden: false,
            new: false,
          },
        ],
      })
    );
  }),
  rest.get("http://localhost:4200/realms/slug/v0", (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: "0d91d28f-182c-4684-aa6c-9159059a5b49",
        slug: "v0",
        settings: {
          root: { cursor: {} },
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
      })
    );
  }),
  rest.get(
    "http://localhost:4200/threads/8b2646af-2778-487e-8e44-7ae530c2549c",
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          id: "8b2646af-2778-487e-8e44-7ae530c2549c",
          parent_board_slug: "gore",
          starter: {
            id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
            parent_thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
            parent_post_id: null,
            created_at: "2020-09-25T05:42:00.00Z",
            content:
              '[{"insert":"Remember to be excellent to each other and only be mean to fictional characters!"}]',
            secret_identity: {
              name: "GoreMaster5000",
              avatar:
                "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
              color: "red",
              accessory: null,
            },
            friend: false,
            own: false,
            new: false,
            tags: {
              whisper_tags: ["An announcement from your headmaster!"],
              index_tags: [],
              category_tags: [],
              content_warnings: [],
            },
            total_comments_amount: 2,
            new_comments_amount: 0,
          },
          posts: [
            {
              id: "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb",
              parent_thread_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
              parent_post_id: null,
              created_at: "2020-09-25T05:42:00.00Z",
              content:
                '[{"insert":"Remember to be excellent to each other and only be mean to fictional characters!"}]',
              secret_identity: {
                name: "GoreMaster5000",
                avatar:
                  "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
                color: "red",
                accessory: null,
              },
              friend: false,
              own: false,
              new: false,
              tags: {
                whisper_tags: ["An announcement from your headmaster!"],
                index_tags: [],
                category_tags: [],
                content_warnings: [],
              },
              total_comments_amount: 2,
              new_comments_amount: 0,
            },
          ],
          comments: {
            "ff9f2ae2-a254-4069-9791-3ac5e6dff5bb": [
              {
                id: "d3c21e0c-7ab9-4cb6-b1ed-1b7e558ba375",
                parent_comment_id: null,
                chain_parent_id: null,
                parent_post_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
                created_at: "2020-10-02T05:43:00.00Z",
                content: '[{"insert":"But can we be mean to you?"}]',
                secret_identity: {
                  name: "DragonFucker",
                  avatar:
                    "https://pbs.twimg.com/profile_images/473496567366705152/JyHRKG7g.jpeg",
                  color: null,
                  accessory: null,
                },
                friend: false,
                own: false,
                new: false,
              },
              {
                id: "146d4087-e11e-4912-9d67-93065b9a0c78",
                parent_comment_id: "d3c21e0c-7ab9-4cb6-b1ed-1b7e558ba375",
                chain_parent_id: null,
                parent_post_id: "8b2646af-2778-487e-8e44-7ae530c2549c",
                created_at: "2020-10-04T05:44:00.00Z",
                content:
                  '[{"insert":"BobaNitro users can be mean to the webmaster once a month."}]',
                secret_identity: {
                  name: "GoreMaster5000",
                  avatar:
                    "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
                  color: "red",
                  accessory: null,
                },
                friend: false,
                own: false,
                new: false,
              },
            ],
          },
          default_view: "thread",
          muted: false,
          hidden: false,
          new: false,
          last_activity_at: "2020-10-04T05:44:00.00Z",
          new_posts_amount: 0,
          new_comments_amount: 0,
          total_comments_amount: 2,
          total_posts_amount: 1,
          direct_threads_amount: 0,
        })
      );
    }
  ),
  rest.get("http://localhost:4200/users/@me/bobadex", (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        seasons: [
          {
            id: "8d64d742-48d5-43e8-9378-bd73c7bfa871",
            realm_id: "v0",
            name: "Default",
            identities_count: 3,
            caught_identities: [
              {
                index: 1,
                identity: {
                  id: "3f0d24b8-decc-4413-8f9d-eace821116a8",
                  name: "Old Time-y Anon",
                  avatar:
                    "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
                },
              },
              {
                index: 3,
                identity: {
                  id: "02be1cb0-e685-4dcb-a05c-adc1054e6fb2",
                  name: "Outdated Meme",
                  avatar:
                    "https://www.clickz.com/wp-content/uploads/2016/03/anontumblr.png",
                },
              },
            ],
          },
        ],
      })
    );
  }),
];
