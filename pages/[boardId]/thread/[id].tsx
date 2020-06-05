import React from "react";
import {
  Layout,
  FeedWithMenu,
  Comment,
  ThreadIndent,
  Post,
  // @ts-ignore
} from "@bobaboard/ui-components";
import PostEditorModal from "../../../components/PostEditorModal";
import CommentEditorModal from "../../../components/CommentEditorModal";
import SideMenu from "../../../components/SideMenu";
import { useRouter } from "next/router";
import axios from "axios";
import { useQuery } from "react-query";

const makePostsTree = (posts: any[]) => {
  if (!posts) {
    return [undefined, {}];
  }
  let root = null;
  const parentChildrenMap: { [key: string]: any } = {};

  posts.forEach((post) => {
    if (!post.parent_post_id) {
      root = post;
      return;
    }
    parentChildrenMap[post.parent_post_id] = [
      post,
      ...(parentChildrenMap[post.parent_post_id] || []),
    ];
  });

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

const ThreadLevel: React.FC<{
  post: any;
  postsMap: { [key: string]: any };
  level: number;
  onNewComment: (id: string) => void;
  onNewContribution: (id: string) => void;
}> = (props) => {
  console.log(Object.keys(props.postsMap).length);
  return (
    <>
      <div className="level">
        <ThreadIndent
          level={props.level}
          key={`${props.level}_${props.post.id}`}
        >
          <div className="post">
            <Post
              key={props.post.id}
              createdTime={"at some point"}
              text={props.post.content}
              secretIdentity={props.post.secret_identity}
              userIdentity={props.post.user_identity}
              onNewContribution={() => props.onNewContribution(props.post.id)}
              onNewComment={() => props.onNewComment(props.post.id)}
              totalComments={props.post.comments?.length}
              directContributions={props.postsMap[props.post.id]?.length}
              totalContributions={getTotalContributions(
                props.post,
                props.postsMap
              )}
              newComments={props.post.new_comments}
              newContributions={props.post.new_contributions}
              centered={Object.keys(props.postsMap).length == 0}
            />
          </div>
        </ThreadIndent>
        {props.post.comments && (
          <ThreadIndent level={props.level + 1}>
            {props.post.comments.map((comment: any, i: number) => (
              <Comment
                key={`${props.post.id}_${i}`}
                id="1"
                secretIdentity={comment.secret_identity}
                userIdentity={comment.user_identity}
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
            .level {
              width: 100%;
            }
            .post {
              margin-top: 15px;
            }
          `}
        </style>
      </div>
    </>
  );
};

const getPostsData = async (
  key: string,
  { threadId }: { threadId: string }
) => {
  const response = await axios.get(`threads/${threadId}/`);
  return response.data;
};

function HomePage() {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [postReplyId, setPostReplyId] = React.useState<string | null>(null);
  const [commentReplyId, setCommentReplyId] = React.useState<string | null>(
    null
  );
  const router = useRouter();
  const {
    data: postsData,
    // @ts-ignore
    isFetching: isFetchingPosts,
    // @ts-ignore
    error: fetchPostsError,
  } = useQuery(["postsData", { threadId: router.query.id }], getPostsData);
  const [[root, postsMap], setPostsTree] = React.useState([undefined, {}]);

  React.useEffect(() => {
    setPostsTree(makePostsTree(postsData?.posts) as any);
  }, [postsData]);

  if (!root || !root) {
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
          setPostReplyId(null);
        }}
        onCloseModal={() => setPostReplyId(null)}
        submitUrl={`/posts/${postReplyId}/contribute`}
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
          const parentIndex = postsData.findIndex(
            (post: any) => post.id == commentReplyId
          );
          if (parentIndex == -1) {
            return;
          }
          postsData[parentIndex].comments = [
            ...(postsData[parentIndex].comments || []),
            comment,
          ];
          postsData[parentIndex] = { ...postsData[parentIndex] };
          setCommentReplyId(null);
        }}
        onCloseModal={() => setCommentReplyId(null)}
      />
      <Layout
        mainContent={
          <FeedWithMenu
            sidebarContent={<div></div>}
            feedContent={
              <div
                style={{
                  padding: "20px 0",
                  width: Object.keys(postsMap).length == 0 ? "100%" : "auto",
                }}
              >
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
        sideMenuContent={<SideMenu />}
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
