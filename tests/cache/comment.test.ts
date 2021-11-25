import { CommentType, SecretIdentityType } from "types/Types";
import { expect, test } from "@jest/globals";
import { getThreadDataFromCache, getThreadKey } from "./thread.test";

import { FAVORITE_CHARACTER_GORE_EMPTY_THREAD } from "../data/Thread";
import { QueryClient } from "react-query";
import { addCommentInCache } from "cache/comment";

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
});
