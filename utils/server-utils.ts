import { PostType, CommentType, ThreadType, BoardData } from "../types/Types";

import { DEFAULT_USER_NAME, DEFAULT_USER_AVATAR } from "../components/Auth";
import moment from "moment";

export const makeClientComment = (serverComment: any): CommentType => ({
  commentId: serverComment.comment_id,
  chainParentId: serverComment.chain_parent_id,
  parentCommentId: serverComment.parent_comment,
  secretIdentity: {
    name: serverComment.secret_identity.name,
    avatar: serverComment.secret_identity.avatar,
  },
  userIdentity: serverComment.user_identity && {
    name: serverComment.user_identity.name || DEFAULT_USER_NAME,
    avatar: serverComment.user_identity.avatar || DEFAULT_USER_AVATAR,
  },
  created: serverComment.created,
  content: serverComment.content,
  isNew: serverComment.is_new,
});

export const makeClientPost = (serverPost: any): PostType => ({
  postId: serverPost.post_id,
  threadId: serverPost.thread_id,
  parentPostId: serverPost.parent_post_id,
  secretIdentity: {
    name: serverPost.secret_identity.name,
    avatar: serverPost.secret_identity.avatar,
  },
  userIdentity: serverPost.user_identity && {
    name: serverPost.user_identity.name || DEFAULT_USER_NAME,
    avatar: serverPost.user_identity.avatar || DEFAULT_USER_AVATAR,
  },
  created: serverPost.created,
  content: serverPost.content,
  options: {
    wide: serverPost.options?.wide,
  },
  tags: {
    whisperTags: serverPost.tags.whisper_tags,
    indexTags: serverPost.tags.index_tags,
    categoryTags: serverPost.tags.category_tags,
    contentWarnings: serverPost.tags.content_warnings,
  },
  comments: serverPost.comments?.map(makeClientComment),
  postsAmount: serverPost.posts_amount,
  threadsAmount: serverPost.threads_amount,
  newPostsAmount: serverPost.new_posts_amount,
  newCommentsAmount: serverPost.new_comments_amount,
  isNew: serverPost.is_new,
  isOwn: serverPost.self,
  commentsAmount: serverPost.comments_amount,
});

export const makeClientThread = (serverThread: any): ThreadType => {
  const clientPosts: PostType[] = serverThread.posts.map(makeClientPost);
  return {
    posts: clientPosts,
    isNew: serverThread.posts[0].is_new,
    threadId: serverThread.thread_id,
    boardSlug: serverThread.board_slug,
    newPostsAmount: serverThread.thread_new_posts_amount,
    newCommentsAmount: serverThread.thread_new_comments_amount,
    totalCommentsAmount: serverThread.thread_total_comments_amount,
    totalPostsAmount: serverThread.thread_total_posts_amount,
    directThreadsAmount: serverThread.thread_direct_threads_amount,
    lastActivity: serverThread.thread_last_activity,
    muted: serverThread.muted,
    hidden: serverThread.hidden,
    defaultView: serverThread.default_view,
    personalIdentity: clientPosts.find((post) => post.isOwn)?.secretIdentity,
  };
};

export const makeClientBoardData = (serverBoardData: any): BoardData => {
  return {
    slug: serverBoardData.slug,
    avatarUrl: serverBoardData.avatarUrl,
    tagline: serverBoardData.tagline,
    accentColor: serverBoardData.settings?.accentColor,
    lastUpdate: moment
      .max(
        moment.utc(serverBoardData.last_post),
        moment.utc(serverBoardData.last_comment)
      )
      .toDate(),
    descriptions: serverBoardData.descriptions || [],
    hasUpdates: serverBoardData.has_updates,
    muted: serverBoardData.muted,
    pinnedOrder: serverBoardData.pinned_order
      ? parseInt(serverBoardData.pinned_order)
      : null,
  };
};
