import React from "react";
import {
  Layout,
  FeedWithMenu,
  Comment,
  ThreadIndent,
  Post,
  SideMenu,
  // @ts-ignore
} from "@bobaboard/ui-components";
import PostEditorModal from "../components/PostEditorModal";
import CommentEditorModal from "../components/CommentEditorModal";

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

  console.log(root, parentChildrenMap);
  return [root, parentChildrenMap];
};

const getTotalContributions = (post: any, postsMap: { [key: string]: any }) => {
  let total = 0;
  let next = postsMap[post.id];
  while (next && next.length > 0) {
    total += next.length;
    next = next.flatMap((child: any) => (child && postsMap[child.id]) || []);
  }
  return total;
};

let NEXT_ID = 5;
const getNextId = () => {
  return `${NEXT_ID++}`;
};

const INITIAL_POSTS = [
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
        createdTime: "1 minute ago",
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
        createdTime: "1 minute ago",
        secretIdentity: {
          name: "Bad Guy",
          avatar: "https://placekitten.com/600/600",
        },
      },
      {
        content: '[{"insert":"Skewer me DaDdY!"}]',
        createdTime: "1 minute ago",
        secretIdentity: {
          name: "Bad Guy",
          avatar: "https://placekitten.com/600/600",
        },
      },
      {
        content: '[{"insert":"Skewer me DaDdY!!!!"}]',
        createdTime: "1 minute ago",
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
        createdTime: "1 minute ago",
        secretIdentity: {
          name: "Bad Guy",
          avatar: "https://placekitten.com/600/600",
        },
      },
      {
        content: '[{"insert":"Hell yeah mah boi"}]',
        createdTime: "1 minute ago",
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

const ThreadLevel: React.FC<{
  post: any;
  postsMap: { [key: string]: any };
  level: number;
  onNewComment: (id: string) => void;
  onNewContribution: (id: string) => void;
}> = (props) => {
  return (
    <>
      <div>
        <ThreadIndent
          level={props.level}
          key={`${props.level}_${props.post.id}`}
        >
          <div className="post">
            <Post
              key={props.post.id}
              createdTime={props.post.createdTime}
              text={props.post.text}
              secretIdentity={props.post.secretIdentity}
              userIdentity={props.post.userIdentity}
              onNewContribution={() => props.onNewContribution(props.post.id)}
              onNewComment={() => props.onNewComment(props.post.id)}
              totalComments={props.post.comments?.length}
              directContributions={props.postsMap[props.post.id]?.length}
              totalContributions={getTotalContributions(
                props.post,
                props.postsMap
              )}
              newComments={props.post.newComments}
              newContributions={props.post.newContributions}
            />
          </div>
        </ThreadIndent>
        {props.post.comments && (
          <ThreadIndent level={props.level + 1}>
            {props.post.comments.map((comment: any, i: number) => (
              <Comment
                key={`${props.post.id}_${i}`}
                id="1"
                secretIdentity={comment.secretIdentity}
                userIdentity={comment.userIdentity}
                initialText={comment.content}
              />
            ))}
          </ThreadIndent>
        )}
        {props.postsMap[props.post.id]?.flatMap((post: any) => (
          <ThreadLevel
            key={post.id}
            post={post}
            postsMap={props.postsMap}
            level={props.level + 1}
            onNewComment={props.onNewComment}
            onNewContribution={props.onNewContribution}
          />
        ))}
        <style jsx>
          {`
            .post {
              margin-top: 15px;
            }
          `}
        </style>
      </div>
    </>
  );
};

function HomePage() {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [postReplyId, setPostReplyId] = React.useState<string | null>(null);
  const [commentReplyId, setCommentReplyId] = React.useState<string | null>(
    null
  );
  const [posts, setPosts] = React.useState(INITIAL_POSTS);
  const [[root, postsMap], setPostsTree] = React.useState(
    makePostsTree(INITIAL_POSTS)
  );

  if (!root) {
    return <div />;
  }

  return (
    <div className="main">
      <PostEditorModal
        isOpen={!!postReplyId}
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
          post.answersTo = postReplyId;
          setPosts([post, ...posts]);
          setPostsTree(makePostsTree([post, ...posts]));
          setPostReplyId(null);
        }}
        onCloseModal={() => setPostReplyId(null)}
      />
      <CommentEditorModal
        isOpen={!!commentReplyId}
        secretIdentity={{
          name: "Tuxedo Mask",
          avatar: `/tuxedo-mask.jpg`,
        }}
        userIdentity={{
          name: "SexyDaddy69",
          avatar: `/mamoru.png`,
        }}
        onCommentSaved={(comment: any) => {
          const parentIndex = posts.findIndex(
            (post) => post.id == commentReplyId
          );
          if (parentIndex == -1) {
            return;
          }
          posts[parentIndex].comments = [
            ...(posts[parentIndex].comments || []),
            comment,
          ];
          posts[parentIndex] = { ...posts[parentIndex] };
          setPosts([...posts]);
          setPostsTree(makePostsTree([...posts]));
          setCommentReplyId(null);
        }}
        onCloseModal={() => setCommentReplyId(null)}
      />
      <Layout
        mainContent={
          <FeedWithMenu
            sidebarContent={<div></div>}
            feedContent={
              <div style={{ padding: "20px 0" }}>
                <ThreadLevel
                  post={root}
                  postsMap={postsMap as any}
                  level={0}
                  onNewComment={(answerTo: string) =>
                    setCommentReplyId(answerTo)
                  }
                  onNewContribution={(answerTo: string) =>
                    setPostReplyId(answerTo)
                  }
                />
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
