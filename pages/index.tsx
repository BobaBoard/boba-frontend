import { Layout, BoardFeed } from "@bobaboard/ui-components";
import Head from "next/head";

function HomePage() {
  const [showSidebar, setShowSidebar] = React.useState(false);

  return (
    <div>
      {" "}
      <Head key="layoutHead">
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <script
          id="twitter-wjs"
          type="text/javascript"
          async
          defer
          src="//platform.twitter.com/widgets.js"
        ></script>
      </Head>
      <Layout
        mainContent={
          <BoardFeed
            posts={[
              {
                createdTime: "5 minutes ago",
                text:
                  '[{"insert":"Nishin Masumi Reading Group (Week 2)"},{"attributes":{"header":1},"insert":"\\n"},{"insert":"\\nAs you know, we\'re going through \\"Host is Down\\" this week! \\n\\n"},{"attributes":{"alt":"Host is Down by Mado Fuchiya (Nishin)"},"insert":{"image":"https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1564868627l/50190748._SX1200_SY630_.jpg"}},{"insert":"\\n\\nThis is the official discussion thread. Feel free to comment, but remember to tag spoilers (or suffer the mods\' wrath).\\n"}]',
                secretIdentity: {
                  name: "Good Guy",
                  avatar: `https://placekitten.com/200/300`,
                },
                newPost: true,
              },
              {
                createdTime: "10 hours ago",
                text:
                  '[{"insert":"Help a Thirsty, Thirsty Anon"},{"attributes":{"header":1},"insert":"\\n"},{"insert":"\\nI recently discovered "},{"attributes":{"link":"https://myanimelist.net/manga/115345/MADK"},"insert":"MadK"},{"insert":", and I\'ve fallen in love with the combination of beautiful art and great story. I\'ve been trying to put together a list of recs of the angstiest, goriest series out there. It\'s been surprisingly hard to find the Good Shit.\\n\\nWhat\'s your favorite series and why?\\n"}]',
                secretIdentity: {
                  name: "Tuxedo Mask",
                  avatar: `https://placekitten.com/200/300`,
                },
                userIdentity: {
                  name: "SexyDaddy69",
                  avatar: `https://placekitten.com/200/300`,
                },
                options: {
                  wide: true,
                },
                newComments: 5,
              },
              {
                createdTime: "yesterday",
                text:
                  '[{"insert":"Monthly Art Roundup"},{"attributes":{"header":1},"insert":"\\n"},{"insert":"\\nPost your favorites! As usual, remember to embed the actual posts (unless it\'s your own art, then do as you wish). Reposting is a no-no. \\n\\nI\'ll start with one of my favorite artists:\\n"},{"insert":{"tweet":"https://twitter.com/notkrad/status/1222638147886034945"}}]',
                secretIdentity: {
                  name: "Bad Guy",
                  avatar: `https://placekitten.com/200/300`,
                },
                newComments: 5,
                newContributions: 2,
              },
              {
                createdTime: "3 days ago",
                text:
                  '[{"insert":{"block-image":"https://media.tenor.com/images/97b761adf7bdc9d72fc1fadbbaa3a4a6/tenor.gif"}},{"insert":"(I got inspired to write a quick cannibalism drabble. Wanted to share it and get your opinion while I decide whether to turn it into a longer fic!)\\n"}]',
                secretIdentity: {
                  name: "Nice Therapist",
                  avatar: `https://placekitten.com/200/300`,
                },
                userIdentity: {
                  name: "xXxChesapeakeRipperxXx",
                  avatar: `https://placekitten.com/200/300`,
                },
                newContributions: 3,
              },
            ]}
            showSidebar={showSidebar}
            onCloseSidebar={() => setShowSidebar(false)}
            boardInfo={{
              slug: "gore",
              avatar: `https://placekitten.com/200/300`,
              description: "Love me some bruised bois (and more).",
              color: "#f96680",
            }}
            accentColor={"#f96680"}
          />
        }
        sideMenuContent={
          // <SideMenu
          //   board={{
          //     slug: "gore",
          //     avatar: `https://placekitten.com/200/300`,
          //     description: "Love me some bruised bois (and more).",
          //     color: "#f96680",
          //   }}
          // />
          <div />
        }
        headerAccent="#f96680"
        title="!gore"
        onTitleClick={() => {
          setShowSidebar(!showSidebar);
        }}
      />
      <style jsx global>{`
        body {
          font-family: "Inter", sans-serif;
          overflow: hidden;
        }
      `}</style>
      `
    </div>
  );
}

export default HomePage;
