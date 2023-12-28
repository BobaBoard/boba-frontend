import { CommentType, FeedType, SecretIdentityType } from "types/Types";
import { InfiniteData, QueryClient } from "react-query";
import { getThreadDataFromCache, getThreadKey } from "./thread.test";

import { FAVORITE_CHARACTER_GORE_EMPTY_THREAD } from "../data/Thread";
import { FAVORITE_CHARACTER_GORE_THREAD_SUMMARY } from "../data/ThreadSummary";
import { addCommentInCache } from "lib//api/cache/comment";
import { getBoardQueryKey } from "./activity.test";
import { getThreadSummaryFromBoardFeedCache } from "./post.test";

const TEST_COMMENT: CommentType = {
  commentId: "146d4087-e11e-4912-9d67-93065b9a0c78",
  created: "2020-04-01T00:00:00.000Z",
  chainParentId: null,
  parentCommentId: "d3c21e0c-7ab9-4cb6-b1ed-1b7e558ba375",
  parentPostId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.starter.postId,
  secretIdentity: {
    name: "GoreMaster5000",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2Fc26e8ce9-a547-4ff4-9486-7a2faca4d873%2F6518df53-2031-4ac5-8d75-57a0051ed924?alt=media&token=23df54b7-297c-42ff-a0ea-b9862c9814f8",
    color: "red",
    accessory: undefined,
  },
  userIdentity: { name: "bobatan", avatar: "/bobatan.png" },
  content:
    '[{"insert":"BobaNitro users can be mean to the webmaster once a month."}]',
  isNew: true,
  isOwn: false,
};

const GORE_BOARD_FEED_SINGLE_PAGE: InfiniteData<FeedType> = {
  pageParams: [],
  pages: [
    {
      cursor: { next: null },
      activity: [FAVORITE_CHARACTER_GORE_THREAD_SUMMARY],
    },
  ],
};

describe("Tests for addCommentInCache (thread cache)", () => {
  test("It correctly adds a single comment in thread cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getThreadKey({ threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id }),
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD
    );

    const newComment = {
      ...TEST_COMMENT,
      isNew: true,
    };
    addCommentInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
      boardId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.parentBoardId,
      newComments: [newComment],
      replyTo: {
        postId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.starter.postId,
        commentId: null,
      },
    });

    const threadInCache = getThreadDataFromCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
    })!;

    // Check that the amounts of posts and comments are correct
    expect(threadInCache.totalPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.totalPostsAmount
    );
    expect(threadInCache.directThreadsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.directThreadsAmount
    );
    expect(threadInCache.newPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.newPostsAmount
    );

    expect(threadInCache.totalCommentsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.totalCommentsAmount + 1
    );
    expect(threadInCache.newCommentsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.newCommentsAmount + 1
    );

    expect(
      threadInCache.comments[
        FAVORITE_CHARACTER_GORE_EMPTY_THREAD.starter.postId
      ]
    ).toContainEqual(newComment);

    // Check that the thread object has also been updated
    expect(threadInCache).not.toBe(FAVORITE_CHARACTER_GORE_EMPTY_THREAD);
  });

  test("It correctly adds personal identity in thread cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getThreadKey({ threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id }),
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD
    );

    const newSecretIdentity: SecretIdentityType = {
      name: "SUPER_SECRET_IDENTITY_NAME",
      avatar: "SUPER_SECRET_IDENTITY_AVATAR",
    };
    const ownComment: CommentType = {
      ...TEST_COMMENT,
      isOwn: true,
      secretIdentity: newSecretIdentity,
    };
    addCommentInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
      boardId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.parentBoardId,
      newComments: [ownComment],
      replyTo: {
        postId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.starter.postId,
        commentId: null,
      },
    });

    const threadInCache = getThreadDataFromCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
    })!;

    expect(threadInCache.personalIdentity).toEqual(newSecretIdentity);
  });

  // TODO: add a test for multiple comments
});

describe("Tests for addCommentInCache (feed cache)", () => {
  // TODO: add test for transformThreadSummary
  test("It correctly adds the comment in feed cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({
        boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      }),
      GORE_BOARD_FEED_SINGLE_PAGE
    );

    const newComment = {
      ...TEST_COMMENT,
      isNew: true,
    };
    addCommentInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      newComments: [newComment],
      replyTo: {
        postId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.starter.postId,
        commentId: null,
      },
    });

    const threadSummary = getThreadSummaryFromBoardFeedCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
    })!;

    expect(threadSummary.totalCommentsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.totalCommentsAmount + 1
    );
    expect(threadSummary.totalPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.totalPostsAmount
    );
    expect(threadSummary.directThreadsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.directThreadsAmount
    );

    // Check that the thread object has also been updated
    expect(threadSummary).not.toBe(FAVORITE_CHARACTER_GORE_THREAD_SUMMARY);
  });

  test("It correctly deals with new comment in feed cache (others)", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({
        boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      }),
      GORE_BOARD_FEED_SINGLE_PAGE
    );

    const newComment = {
      ...TEST_COMMENT,
      isNew: true,
      isOwn: false,
    };
    addCommentInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      newComments: [newComment],
      replyTo: {
        postId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.starter.postId,
        commentId: null,
      },
    });

    const threadSummary = getThreadSummaryFromBoardFeedCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
    })!;

    expect(threadSummary.newCommentsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.newPostsAmount + 1
    );
    expect(threadSummary.newPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.newCommentsAmount
    );
  });

  test("It correctly deals with new posts in feed cache (own)", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({
        boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      }),
      GORE_BOARD_FEED_SINGLE_PAGE
    );

    const ownComment = {
      ...TEST_COMMENT,
      isNew: true,
      isOwn: true,
    };
    addCommentInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      newComments: [ownComment],
      replyTo: {
        postId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.starter.postId,
        commentId: null,
      },
    });

    const threadSummary = getThreadSummaryFromBoardFeedCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
    })!;

    // Since the comment has been made by the user themself, the feed should not have any new comment.
    expect(threadSummary.newPostsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.newPostsAmount
    );
    expect(threadSummary.newCommentsAmount).toEqual(
      FAVORITE_CHARACTER_GORE_EMPTY_THREAD.newCommentsAmount
    );
  });

  test("It correctly adds personal identity in feed cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      getBoardQueryKey({
        boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
      }),
      GORE_BOARD_FEED_SINGLE_PAGE
    );
    const newSecretIdentity: SecretIdentityType = {
      name: "SUPER_SECRET_IDENTITY_NAME",
      avatar: "SUPER_SECRET_IDENTITY_AVATAR",
    };

    const ownComment: CommentType = {
      ...TEST_COMMENT,
      secretIdentity: newSecretIdentity,
      isNew: true,
      isOwn: true,
    };
    addCommentInCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.id,
      boardId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.parentBoardId,
      newComments: [ownComment],
      replyTo: {
        postId: FAVORITE_CHARACTER_GORE_EMPTY_THREAD.starter.postId,
        commentId: null,
      },
    });

    const threadSummary = getThreadSummaryFromBoardFeedCache(queryClient, {
      threadId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.id,
      boardId: FAVORITE_CHARACTER_GORE_THREAD_SUMMARY.parentBoardId,
    })!;

    expect(threadSummary.personalIdentity).toEqual(newSecretIdentity);
  });
});
