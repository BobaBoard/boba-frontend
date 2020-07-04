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
import { PostType, CommentType } from "../../../types/Types";

const log = debug("bobafrontend:thread-log");

// Transform the array of posts received from the server in a tree
// representation. The return value is comprised of two values:
// the root value is the top post of the thread; the parentChildrenMap
// value is a Map from the string id of a post to its direct children.
const makePostsTree = (posts: PostType[] | undefined) => {
  if (!posts) {
    return {
      root: undefined,
      parentChildrenMap: new Map<string, PostType[]>(),
    };
  }
  let root: PostType | null = null;
  const parentChildrenMap = new Map<string, PostType[]>();

  posts.forEach((post) => {
    if (!post.parentPostId) {
      root = post;
      return;
    }
    parentChildrenMap.set(post.parentPostId, [
      ...(parentChildrenMap.get(post.parentPostId) || ([] as PostType[])),
      post,
    ]);
  });

  return { root, parentChildrenMap };
};

const getTotalContributions = (
  post: PostType,
  postsMap: Map<string, PostType[]>
) => {
  let total = 0;
  let next = postsMap.get(post.postId);
  while (next && next.length > 0) {
    total += next.length;
    next = next.flatMap(
      (child: PostType) => (child && postsMap.get(child.postId)) || []
    );
  }
  return total;
};

const getTotalNewContributions = (
  post: PostType,
  postsMap: Map<string, PostType[]>
) => {
  let total = 0;
  let next = postsMap.get(post.postId);
  while (next && next.length > 0) {
    total += next.reduce(
      (value: number, post: PostType) => value + (post.isNew ? 1 : 0),
      0
    );
    next = next.flatMap(
      (child: PostType) => (child && postsMap.get(child.postId)) || []
    );
  }
  return total;
};

const ThreadLevel: React.FC<{
  post: PostType;
  postsMap: Map<string, PostType[]>;
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
          key={`${props.level}_${props.post.postId}`}
        >
          <div className="post">
            <Post
              key={props.post.postId}
              size={
                props.post.options?.wide ? PostSizes.WIDE : PostSizes.REGULAR
              }
              createdTime={moment.utc(props.post.created).fromNow()}
              text={props.post.content}
              secretIdentity={props.post.secretIdentity}
              userIdentity={props.post.userIdentity}
              onNewContribution={() =>
                props.onNewContribution(props.post.postId)
              }
              onNewComment={() => props.onNewComment(props.post.postId)}
              totalComments={props.post.comments?.length}
              directContributions={
                props.postsMap.get(props.post.postId)?.length
              }
              totalContributions={getTotalContributions(
                props.post,
                props.postsMap
              )}
              newPost={props.isLoggedIn && props.post.isNew}
              newComments={props.isLoggedIn ? props.post.newCommentsAmount : 0}
              newContributions={
                props.isLoggedIn
                  ? getTotalNewContributions(props.post, props.postsMap)
                  : 0
              }
              centered={props.postsMap.size == 0}
              answerable={props.isLoggedIn}
              onNotesClick={() => {}}
              notesUrl={"#"}
              tags={props.post.tags}
            />
          </div>
        </ThreadIndent>
        {props.post.comments && (
          <ThreadIndent level={props.level + 1}>
            {props.post.comments.map((comment: CommentType, i: number) => (
              <Comment
                key={comment.commentId}
                id={comment.commentId}
                secretIdentity={comment.secretIdentity}
                userIdentity={comment.userIdentity}
                initialText={comment.content}
              />
            ))}
          </ThreadIndent>
        )}
        {props.postsMap.get(props.post.postId)?.flatMap((post: PostType) => (
          <ThreadLevel
            key={post.postId}
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
const MemoizedThreadLevel = React.memo(ThreadLevel);

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
    isFetching: isFetchingPosts,
    refetch: refetchTread,
  } = useQuery(["threadData", { threadId }], getThreadData, {
    refetchOnWindowFocus: false,
  });

  const [readThread] = useMutation(() => markThreadAsRead({ threadId }), {
    onSuccess: () => {
      log(`Successfully marked thread as read`);
    },
  });
  const { root, parentChildrenMap } = React.useMemo(
    () => makePostsTree(threadData?.posts),
    [threadData]
  );

  React.useEffect(() => {
    if (isLoggedIn) {
      readThread();
    }
  }, []);

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
                <MemoizedThreadLevel
                  post={root}
                  postsMap={parentChildrenMap}
                  level={0}
                  onNewComment={setCommentReplyId}
                  onNewContribution={setPostReplyId}
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
