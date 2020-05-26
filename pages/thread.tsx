import React from "react";
import {
  Layout,
  FeedWithMenu,
  Comment,
  ThreadIndent,
  Post,
  SideMenu,
} from "@bobaboard/ui-components";

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

const makePostsTree = (posts: any[]) => {
  let root = null;
  const parentChildrenMap: { [key: string]: any } = {};

  posts.forEach((post) => {
    if (!post.answersTo) {
      root = post;
      return;
    }
    parentChildrenMap[post.answersTo] = [
      post,
      ...(parentChildrenMap[post.answersTo] || []),
    ];
  });

  return [root, parentChildrenMap];
};

const getTotalContributions = (post: any, postsMap: { [key: string]: any }) => {
  let total = 0;
  let next = postsMap[post.id];
  while (next && next.length > 0) {
    total += next.length;
    console.log(next);
    next = next.flatMap((child: any) => (child && postsMap[child.id]) || []);
    console.log(next);
  }
  return total;
};

const makePost = (
  post: any,
  postsMap: { [key: string]: any },
  level: number
) => (
  <div>
    <ThreadIndent level={level}>
      <div className="post">
        <Post
          createdTime={post.createdTime}
          text={post.text}
          secretIdentity={post.secretIdentity}
          userIdentity={post.userIdentity}
          onNewContribution={() => console.log("click!")}
          onNewComment={() => console.log("click!")}
          totalComments={post.comments?.length}
          directContributions={postsMap[post.id]?.length}
          totalContributions={getTotalContributions(post, postsMap)}
          newComments={post.newComments}
          newContributions={post.newContributions}
        />
      </div>
    </ThreadIndent>
    {post.comments && (
      <ThreadIndent level={level + 1}>
        {post.comments.map((comment: any) => (
          <Comment
            id="1"
            secretIdentity={comment.secretIdentity}
            initialText={comment.content}
            onCancel={() => console.log("hey")}
            onSubmit={() => console.log("hey")}
          />
        ))}
      </ThreadIndent>
    )}
    <style jsx>
      {`
        .post {
          margin-top: 15px;
        }
      `}
    </style>
  </div>
);

const buildFromLevel = (
  root: any,
  postsMap: { [key: string]: any },
  level: number
): JSX.Element[] => {
  return [
    makePost(root, postsMap, level),
    ...(postsMap[root.id]?.flatMap((post: any) =>
      buildFromLevel(post, postsMap, level + 1)
    ) || []),
  ];
};

const posts = [
  {
    id: "1",
    createdTime: "5 minutes ago",
    text:
      '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"block-image":"https://cdn.discordapp.com/attachments/443967088118333442/691486081895628830/unknown.png"}}, {"attributes":{"italic":true},"insert":"You have my sword..."}]',
    secretIdentity: {
      name: "Good Guy",
      avatar: "https://placekitten.com/200/300",
    },
    comments: [
      {
        content: '[{"insert":"Aragorn more like AraDAMN"}]',
        created: "1 minute ago",
        secretIdentity: {
          name: "Bad Guy",
          avatar: "https://placekitten.com/600/600",
        },
      },
    ],
  },
  {
    id: "2",
    answersTo: "1",
    createdTime: "10 hours ago",
    text:
      '[{"insert":{"block-image":"https://si.wsj.net/public/resources/images/BN-GA217_legola_G_20141215080444.jpg"}}, {"attributes":{"italic":true}, "insert":"...and my bow..."}]',
    secretIdentity: {
      name: "Tuxedo Mask",
      avatar: "https://placekitten.com/400/300",
    },
    userIdentity: {
      name: "SexyDaddy69",
      avatar: "https://placekitten.com/200/200",
    },
    comments: [
      {
        content: '[{"insert":"Skewer me DaDdY"}]',
        created: "1 minute ago",
        secretIdentity: {
          name: "Bad Guy",
          avatar: "https://placekitten.com/600/600",
        },
      },
      {
        content: '[{"insert":"Skewer me DaDdY!"}]',
        created: "1 minute ago",
        secretIdentity: {
          name: "Bad Guy",
          avatar: "https://placekitten.com/600/600",
        },
      },
      {
        content: '[{"insert":"Skewer me DaDdY!!!!"}]',
        created: "1 minute ago",
        secretIdentity: {
          name: "Bad Guy",
          avatar: "https://placekitten.com/600/600",
        },
      },
    ],
    newComments: 3,
  },
  {
    id: "3",
    answersTo: "2",
    createdTime: "yesterday",
    text:
      '[{"insert":{"block-image":"https://cdn.discordapp.com/attachments/443967088118333442/691401632940032040/AbJqbbOwrc74AAAAAElFTkSuQmCC.png"}}]',
    secretIdentity: {
      name: "Bad Guy",
      avatar: "https://placekitten.com/600/600",
    },
    comments: [
      {
        content: '[{"insert":"Stop it!!"}]',
        created: "1 minute ago",
        secretIdentity: {
          name: "Bad Guy",
          avatar: "https://placekitten.com/600/600",
        },
      },
      {
        content: '[{"insert":"Hell yeah mah boi"}]',
        created: "1 minute ago",
        secretIdentity: {
          name: "Bad Guy",
          avatar: "https://placekitten.com/600/600",
        },
      },
    ],
    newContributions: 1,
  },
  {
    id: "4",
    answersTo: "3",
    createdTime: "yesterday",
    text:
      '[{"insert":{"block-image":"https://littlelessonslearned.files.wordpress.com/2012/03/the-lorax-pic091.jpg"}}]',
    secretIdentity: {
      name: "Bad Guy",
      avatar: "https://placekitten.com/600/600",
    },
    newPost: true,
  },
];
const postsTree = makePostsTree(posts);

function HomePage() {
  const [showSidebar, setShowSidebar] = React.useState(false);

  const [root, postsMap] = postsTree;
  if (!root) {
    return <div />;
  }

  return (
    <div className="main">
      <Layout
        mainContent={
          <FeedWithMenu
            sidebarContent={<div></div>}
            feedContent={
              <div style={{ padding: "20px 0" }}>
                {buildFromLevel(root, postsMap as any, 0)}
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
        headerAccent="#f96680"
        title="!gore"
        onTitleClick={() => {
          setShowSidebar(!showSidebar);
        }}
      />
    </div>
  );
}

export default HomePage;
