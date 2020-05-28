import React from "react";
import {
  Layout,
  Post,
  PostSizes,
  FeedWithMenu,
  BoardSidebar,
  PostingActionButton,
  SideMenu,
  // @ts-ignore
} from "@bobaboard/ui-components";
import PostEditorModal from "../components/PostEditorModal";
import axios from "axios";
import { useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query-devtools";

const PINNED_BOARDS = [
  {
    slug: "gore",
    avatar: "/gore.png",
    description: "Love me some bruised bois (and more).",
    color: "#f96680",
  },
  {
    slug: "anime",
    avatar: "/anime.png",
    description: "We put the weeb in dweeb.",
    color: "#24d282",
    updates: 2,
    backgroundColor: "#131518",
  },
  {
    slug: "crack",
    avatar: "/crack.png",
    description: "What's crackalackin",
    color: "#f9e066",
    updates: 3,
    backgroundColor: "#131518",
  },
  {
    slug: "fic-club",
    avatar: "/book.png",
    description: "Come enjoy all the fics!",
    color: "#7724d2",
    updates: 5,
    backgroundColor: "#131518",
  },
  {
    slug: "meta",
    avatar: "/meta.png",
    description: "In My TiMeS wE CaLlEd It WaNk",
    color: "#f9e066",
  },
  {
    slug: "villain-thirst",
    avatar: "/villains.png",
    description: "Love to love 'em.",
    color: "#e22b4b",
  },
];
const SEARCH_BOARDS = [
  {
    slug: "villain-thirst",
    avatar: "/villains.png",
    description: "Love to love 'em.",
    color: "#e22b4b",
  },
  {
    slug: "art-crit",
    avatar: "/art-crit.png",
    description: "Let's learn together!",
    color: "#27caba",
  },
];
const RECENT_BOARDS = [
  {
    slug: "gore",
    avatar: "/gore.png",
    description: "Love me some bruised bois (and more).",
    color: "#f96680",
  },
  {
    slug: "oncie-den",
    avatar: "/onceler-board.png",
    description: "Party like it's 2012",
    color: "#27caba",
    updates: 10,
    backgroundColor: "#131518",
  },
  {
    slug: "fic-club",
    avatar: "/book.png",
    description: "Come enjoy all the fics!",
    color: "#7724d2",
    updates: 5,
    backgroundColor: "#131518",
  },
  {
    slug: "kink-memes",
    avatar: "/kink-meme.png",
    description: "No limits. No shame.",
    color: "#000000",
  },
  {
    slug: "crack",
    avatar: "/crack.png",
    description: "What's crackalackin",
    color: "#f9e066",
    updates: 3,
    backgroundColor: "#131518",
  },
];

let NEXT_ID = 0;
const getNextId = () => {
  return NEXT_ID++;
};

const getBoardData = async () => {
  const response = await axios.get("http://localhost:4200/boards/gore");
  return response.data;
};

function HomePage() {
  const [posts, setPosts] = React.useState<any[]>([
    {
      id: getNextId(),
      createdTime: "5 minutes ago",
      text:
        '[{"insert":"Nishin Masumi Reading Group (Week 2)"},{"attributes":{"header":1},"insert":"\\n"},{"insert":"\\nAs you know, we\'re going through \\"Host is Down\\" this week! \\n\\n"},{"attributes":{"alt":"Host is Down by Mado Fuchiya (Nishin)"},"insert":{"image":"https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1564868627l/50190748._SX1200_SY630_.jpg"}},{"insert":"\\n\\nThis is the official discussion thread. Feel free to comment, but remember to tag spoilers (or suffer the mods\' wrath).\\n"}]',
      secretIdentity: {
        name: "Good Guy",
        avatar: `/oncie.jpg`,
      },
      totalComments: 1,
      newPost: true,
    },
    {
      id: getNextId(),
      createdTime: "10 hours ago",
      text:
        '[{"insert":"Help a Thirsty, Thirsty Anon"},{"attributes":{"header":1},"insert":"\\n"},{"insert":"\\nI recently discovered "},{"attributes":{"link":"https://myanimelist.net/manga/115345/MADK"},"insert":"MadK"},{"insert":", and I\'ve fallen in love with the combination of beautiful art and great story. I\'ve been trying to put together a list of recs of the angstiest, goriest series out there. It\'s been surprisingly hard to find the Good Shit.\\n\\nWhat\'s your favorite series and why?\\n"}]',
      secretIdentity: {
        name: "Tuxedo Mask",
        avatar: `/tuxedo-mask.jpg`,
      },
      userIdentity: {
        name: "SexyDaddy69",
        avatar: `/mamoru.png`,
      },
      options: {
        wide: true,
      },
      newComments: 2,
      totalComments: 2,
      totalContributions: 1,
      directContributions: 1,
    },
    {
      id: getNextId(),
      createdTime: "yesterday",
      text:
        '[{"insert":"Monthly Art Roundup"},{"attributes":{"header":1},"insert":"\\n"},{"insert":"\\nPost your favorites! As usual, remember to embed the actual posts (unless it\'s your own art, then do as you wish). Reposting is a no-no. \\n\\nI\'ll start with one of my favorite artists:\\n"},{"insert":{"tweet":"https://twitter.com/notkrad/status/1222638147886034945"}}]',
      secretIdentity: {
        name: "Bad Guy",
        avatar: `/greedler.jpg`,
      },
      newComments: 5,
      newContributions: 2,
      totalComments: 6,
      totalContributions: 5,
      directContributions: 3,
    },
    {
      id: getNextId(),
      createdTime: "3 days ago",
      text:
        '[{"insert":{"block-image":"https://media.tenor.com/images/97b761adf7bdc9d72fc1fadbbaa3a4a6/tenor.gif"}},{"insert":"(I got inspired to write a quick cannibalism drabble. Wanted to share it and get your opinion while I decide whether to turn it into a longer fic!)\\n"}]',
      secretIdentity: {
        name: "Nice Therapist",
        avatar: `/hannibal.png`,
      },
      userIdentity: {
        name: "xXxChesapeakeRipperxXx",
        avatar: `/hannibal.png`,
      },
      newContributions: 3,
      directContributions: 3,
      totalContributions: 3,
    },
  ]);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [postEditorOpen, setPostEditorOpen] = React.useState(false);
  const { status, data, isFetching, error } = useQuery(
    "boardData",
    getBoardData
  );

  return (
    <div className="main">
      <PostEditorModal
        isOpen={postEditorOpen}
        secretIdentity={{
          name: "Tuxedo Mask",
          avatar: `/tuxedo-mask.jpg`,
        }}
        userIdentity={{
          name: "SexyDaddy69",
          avatar: `/mamoru.png`,
        }}
        onPostSaved={(post: any) => {
          post.id = getNextId();
          setPosts([post, ...posts]);
          setPostEditorOpen(false);
        }}
        onCloseModal={() => setPostEditorOpen(false)}
      />
      <Layout
        mainContent={
          <FeedWithMenu
            sidebarContent={
              <BoardSidebar
                board={{
                  slug: status === "loading" ? "loading..." : data.slug,
                  avatar: `/gore.png`,
                  description: "Love me some bruised bois (and more).",
                  color: "#f96680",
                  boardWideTags: [
                    { name: "gore", color: "#f96680" },
                    { name: "guro", color: "#e22b4b" },
                    { name: "nsfw", color: "#27caba" },
                    { name: "dead dove", color: "#f9e066" },
                  ],
                  canonicalTags: [
                    { name: "request", color: "#27caba" },
                    { name: "blood", color: "#f96680" },
                    { name: "knifeplay", color: "#93b3b0" },
                    { name: "aesthetic", color: "#24d282" },
                    { name: "impalement", color: "#27caba" },
                    { name: "skullfuck", color: "#e22b4b" },
                    { name: "hanging", color: "#f9e066" },
                    { name: "torture", color: "#f96680" },
                    { name: "necrophilia", color: "#93b3b0" },
                    { name: "shota", color: "#e22b4b" },
                    { name: "fanfiction", color: "#27caba" },
                    { name: "rec", color: "#f9e066" },
                    { name: "doujinshi", color: "#f96680" },
                    { name: "untagged", color: "#93b3b0" },
                  ],
                  contentRulesTags: [
                    { name: "shota", allowed: true },
                    { name: "nsfw", allowed: true },
                    { name: "noncon", allowed: true },
                    { name: "IRL", allowed: false },
                    { name: "RP", allowed: false },
                  ],
                  otherRules: (
                    <div>
                      <ul>
                        <li>
                          Shota <strong>must</strong> be tagged.
                        </li>
                        <li>
                          Requests go in the appropriate tag. If the same
                          request has been made less than a month ago, it will
                          be deleted by the mods.
                        </li>
                        <li>
                          Mods might add any TWs tag as they see fit. If you
                          need help, add #untagged and a mod will take care of
                          it.
                        </li>
                      </ul>
                    </div>
                  ),
                }}
              />
            }
            feedContent={
              <div className="main">
                {posts.map((post, i) => (
                  <div className="post">
                    <Post
                      key={post.id}
                      createdTime={post.createdTime}
                      text={post.text}
                      secretIdentity={post.secretIdentity}
                      userIdentity={post.userIdentity}
                      onNewContribution={() => console.log("click!")}
                      onNewComment={() => console.log("click!")}
                      size={
                        post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR
                      }
                      newPost={post.newPost}
                      newComments={post.newComments}
                      newContributions={post.newContributions}
                      totalComments={post.totalComments}
                      totalContributions={post.totalContributions}
                      directContributions={post.directContributions}
                      collapsed={!!post.newComments && !!post.newContributions}
                    />
                  </div>
                ))}
              </div>
            }
          />
        }
        sideMenuContent={
          <SideMenu
            pinnedBoards={PINNED_BOARDS}
            searchBoards={SEARCH_BOARDS}
            recentBoards={RECENT_BOARDS}
          />
        }
        actionButton={
          <PostingActionButton
            accentColor={"#f96680"}
            onNewPost={() => setPostEditorOpen(true)}
          />
        }
        headerAccent="#f96680"
        title="!gore"
        onTitleClick={() => {
          setShowSidebar(!showSidebar);
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />}
      <style jsx>{`
        .post {
          margin: 20px auto;
          width: 100%;
        }
        .post > :global(div) {
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}

export default HomePage;
