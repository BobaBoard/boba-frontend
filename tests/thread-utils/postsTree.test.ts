// TODO: figure out absolute import paths
import { makePostsTree } from "../../utils/thread-utils";
import { test, expect } from "@jest/globals";

const makePost = ({
  postId,
  parentPostId,
}: {
  postId: string;
  parentPostId?: string;
}) => {
  return {
    postId,
    parentPostId: parentPostId || "",
    threadId: "",
    secretIdentity: {
      name: "",
      avatar: "",
    },
    created: "",
    content: "",
    options: {},
    tags: {
      whisperTags: [],
      indexTags: [],
      categoryTags: [],
      contentWarnings: [],
    },
    postsAmount: 0,
    commentsAmount: 0,
    threadsAmount: 0,
    newPostsAmount: 0,
    newCommentsAmount: 0,
    isNew: false,
  };
};

test("makes posts tree (empty array)", () => {
  const postsTree = makePostsTree([], "test");
  expect(postsTree).toStrictEqual({
    parentChildrenMap: new Map(),
    postsDisplaySequence: [],
    root: null,
  });
});

test("makes posts tree (undefined array)", () => {
  const postsTree = makePostsTree(undefined, "test");
  expect(postsTree).toStrictEqual({
    parentChildrenMap: new Map(),
    postsDisplaySequence: [],
    root: null,
  });
});

test("makes posts tree (root only)", () => {
  const postsTree = makePostsTree(
    [
      makePost({
        postId: "1",
      }),
    ],
    "test"
  );

  expect(postsTree).toEqual({
    parentChildrenMap: new Map(),
    postsDisplaySequence: [expect.objectContaining({ postId: "1" })],
    root: expect.objectContaining({ postId: "1" }),
  });
});

test("makes posts tree (one level)", () => {
  /* Structure:
   * 1 -> 2
   *   -> 3
   */
  const postsTree = makePostsTree(
    [
      makePost({
        postId: "1",
      }),
      makePost({
        postId: "2",
        parentPostId: "1",
      }),
      makePost({
        postId: "3",
        parentPostId: "1",
      }),
    ],
    "test"
  );

  expect(postsTree).toEqual({
    parentChildrenMap: new Map([
      [
        "1",
        {
          parent: null,
          post: expect.objectContaining({ postId: "1" }),
          children: expect.arrayContaining([
            expect.objectContaining({ postId: "2" }),
            expect.objectContaining({ postId: "3" }),
          ]),
        },
      ],
    ]),
    postsDisplaySequence: expect.arrayContaining([
      expect.objectContaining({ postId: "1" }),
      expect.objectContaining({ postId: "2" }),
      expect.objectContaining({ postId: "3" }),
    ]),
    root: expect.objectContaining({ postId: "1" }),
  });
});

test("makes posts tree (multiple levels)", () => {
  /* Structure:
   * 1 -> 2
   *   -> 3 -> 4
   */
  const postsTree = makePostsTree(
    [
      makePost({
        postId: "1",
      }),
      makePost({
        postId: "2",
        parentPostId: "1",
      }),
      makePost({
        postId: "3",
        parentPostId: "1",
      }),
      makePost({
        postId: "4",
        parentPostId: "3",
      }),
    ],
    "test"
  );

  expect(postsTree).toEqual({
    parentChildrenMap: new Map([
      [
        "1",
        {
          parent: null,
          post: expect.objectContaining({ postId: "1" }),
          children: expect.arrayContaining([
            expect.objectContaining({ postId: "2" }),
            expect.objectContaining({ postId: "3" }),
          ]),
        },
      ],
      [
        "3",
        {
          parent: expect.objectContaining({ postId: "1" }),
          post: expect.objectContaining({ postId: "3" }),
          children: expect.arrayContaining([
            expect.objectContaining({ postId: "4" }),
          ]),
        },
      ],
    ]),
    postsDisplaySequence: expect.arrayContaining([
      expect.objectContaining({ postId: "1" }),
      expect.objectContaining({ postId: "2" }),
      expect.objectContaining({ postId: "3" }),
      expect.objectContaining({ postId: "4" }),
    ]),
    root: expect.objectContaining({ postId: "1" }),
  });
});
