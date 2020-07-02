import React from "react";
import {
  FeedWithMenu,
  Comment,
  ThreadIndent,
  Post,
  PostSizes,
  // @ts-ignore
} from "@bobaboard/ui-components";
import Layout from "../../../components/Layout";
import PostEditorModal from "../../../components/PostEditorModal";
import CommentEditorModal from "../../../components/CommentEditorModal";
import { useRouter } from "next/router";
import { getThreadData, markThreadAsRead } from "../../../utils/queries";
import { useQuery, useMutation } from "react-query";
import { useAuth } from "../../../components/Auth";
import moment from "moment";
import debug from "debug";

const log = debug("bobafrontend:thread-log");

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
      ...(parentChildrenMap[post.parent_post_id] || []),
      post,
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
const getTotalNewContributions = (
  post: any,
  postsMap: { [key: string]: any }
) => {
  let total = 0;
  let next = postsMap[post.id];
  while (next && next.length > 0) {
    total += next.reduce(
      (value: number, post: any) => value + (post.is_new ? 1 : 0),
      0
    );
    next = next.flatMap((child: any) => (child && postsMap[child.id]) || []);
  }
  return total;
};

const ThreadLevel: React.FC<{
  post: any;
  postsMap: { [key: string]: any };
  level: number;
  onNewComment: (id: string) => void;
  onNewContribution: (id: string) => void;
  isLoggedIn: boolean;
}> = (props) => {
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
              size={
                props.post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR
              }
              createdTime={moment.utc(props.post.created).fromNow()}
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
              newPost={props.isLoggedIn && props.post.is_new}
              newComments={props.isLoggedIn && props.post.new_comments}
              newContributions={
                props.isLoggedIn &&
                (getTotalNewContributions(props.post, props.postsMap) as any)
              }
              centered={Object.keys(props.postsMap).length == 0}
              answerable={props.isLoggedIn}
              onNotesClick={() => {}}
              notesUrl={"#"}
              tags={{
                whisperTags: props.post.whisper_tags,
              }}
            />
          </div>
        </ThreadIndent>
        {props.post.comments && (
          <ThreadIndent level={props.level + 1}>
            {props.post.comments.map((comment: any, i: number) => (
              <Comment
                key={props.post.comments.id}
                id={props.post.comments.id}
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
            isLoggedIn={props.isLoggedIn}
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

function ThreadPage() {
  const [postReplyId, setPostReplyId] = React.useState<string | null>(null);
  const [commentReplyId, setCommentReplyId] = React.useState<string | null>(
    null
  );
  const router = useRouter();
  const threadId = router.query.id as string;
  const { user, isLoggedIn } = useAuth();
  const {
    data: threadData,
    // @ts-ignore
    isFetching: isFetchingPosts,
    // @ts-ignore
    error: fetchPostsError,
    refetch: refetchTread,
  } = useQuery(["threadData", { threadId }], getThreadData, {
    refetchOnWindowFocus: false,
  });

  const [readThread] = useMutation(() => markThreadAsRead({ threadId }), {
    onSuccess: () => {
      log(`Successfully marked thread as read`);
    },
  });
  const [[root, postsMap], setPostsTree] = React.useState([undefined, {}]);
  const newComment = React.useCallback(
    (answerTo: string) => setCommentReplyId(answerTo),
    []
  );
  const newContribution = React.useCallback(
    (answerTo: string) => setPostReplyId(answerTo),
    []
  );

  React.useEffect(() => {
    if (isLoggedIn) {
      readThread();
    }
  }, []);

  React.useEffect(() => {
    setPostsTree(makePostsTree(threadData?.posts) as any);
  }, [threadData]);

  if (!root) {
    return <div />;
  }

  const slug: string = router.query.boardId?.slice(1) as string;
  return (
    <div className="main">
      {isLoggedIn && (
        <>
          <PostEditorModal
            isOpen={!!postReplyId}
            secretIdentity={{
              name: "[TBD]",
              avatar: `/tuxedo-mask.jpg`,
            }}
            userIdentity={{
              name: user?.username,
              avatar: user?.avatarUrl,
            }}
            onPostSaved={(post: any) => {
              refetchTread();
              setPostReplyId(null);
            }}
            onCloseModal={() => setPostReplyId(null)}
            submitUrl={`/posts/${postReplyId}/contribute`}
            uploadBaseUrl={`images/${slug}/${router.query.id}/`}
          />
          <CommentEditorModal
            isOpen={!!commentReplyId}
            secretIdentity={{
              name: "[TBD]",
              avatar: `/tuxedo-mask.jpg`,
            }}
            userIdentity={{
              name: user?.username,
              avatar: user?.avatarUrl,
            }}
            onCommentSaved={(comment: any) => {
              refetchTread();
              setCommentReplyId(null);
            }}
            onCloseModal={() => setCommentReplyId(null)}
            submitUrl={`/posts/${commentReplyId}/comment`}
          />
        </>
      )}
      <Layout
        mainContent={
          <FeedWithMenu
            sidebarContent={<div />}
            feedContent={
              <div className="feed-content">
                <ThreadLevel
                  post={root}
                  postsMap={postsMap as any}
                  level={0}
                  onNewComment={newComment}
                  onNewContribution={newContribution}
                  isLoggedIn={isLoggedIn}
                />
              </div>
            }
          />
        }
        title={`!${slug}`}
        onTitleClick={() => {
          router.push(`/[boardId]`, `/!${slug}`, {
            shallow: true,
          });
        }}
        loading={isFetchingPosts}
      />
      <style jsx>
        {`
          .feed-content {
            max-width: 100%;
            padding-bottom: 20px;
          }
        `}
      </style>
    </div>
  );
}

export default ThreadPage;
