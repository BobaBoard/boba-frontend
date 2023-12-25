import { makePost } from "../utils";
// TODO: figure out absolute import paths
import { makePostsTree } from "lib/thread";

test("makes posts tree (empty array)", () => {
  const postsTree = makePostsTree([], "test");
  expect(postsTree).toStrictEqual({
    parentChildrenMap: new Map(),
    postsInfoMap: new Map(),
    postsDisplaySequence: [],
    root: null,
  });
});

test("makes posts tree (undefined array)", () => {
  const postsTree = makePostsTree(undefined, "test");
  expect(postsTree).toStrictEqual({
    parentChildrenMap: new Map(),
    postsInfoMap: new Map(),
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
    postsInfoMap: new Map([
      [
        "1",
        {
          parent: null,
          post: expect.objectContaining({ postId: "1" }),
          children: [],
        },
      ],
    ]),
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
    postsInfoMap: new Map([
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
        "2",
        {
          parent: expect.objectContaining({ postId: "1" }),
          post: expect.objectContaining({ postId: "2" }),
          children: [],
        },
      ],
      [
        "3",
        {
          parent: expect.objectContaining({ postId: "1" }),
          post: expect.objectContaining({ postId: "3" }),
          children: [],
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
   *   -> 3 -> 4 -> 6 -> 7
   *        -> 5
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
      makePost({
        postId: "5",
        parentPostId: "3",
      }),
      makePost({
        postId: "6",
        parentPostId: "4",
      }),
      makePost({
        postId: "7",
        parentPostId: "6",
      }),
    ],
    "test"
  );

  // We don't check for the full postsInfoMap here cause
  // we checked it before, and the parentChildrenMap is
  // calculated as a subset of it anyway.
  expect(postsTree).toMatchObject({
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
            expect.objectContaining({ postId: "5" }),
          ]),
        },
      ],
      [
        "4",
        {
          parent: expect.objectContaining({ postId: "3" }),
          post: expect.objectContaining({ postId: "4" }),
          children: expect.arrayContaining([
            expect.objectContaining({ postId: "6" }),
          ]),
        },
      ],
      [
        "6",
        {
          parent: expect.objectContaining({ postId: "4" }),
          post: expect.objectContaining({ postId: "6" }),
          children: expect.arrayContaining([
            expect.objectContaining({ postId: "7" }),
          ]),
        },
      ],
    ]),
    postsDisplaySequence: expect.arrayContaining([
      expect.objectContaining({ postId: "1" }),
      expect.objectContaining({ postId: "2" }),
      expect.objectContaining({ postId: "3" }),
      expect.objectContaining({ postId: "4" }),
      expect.objectContaining({ postId: "5" }),
      expect.objectContaining({ postId: "6" }),
      expect.objectContaining({ postId: "7" }),
    ]),
    root: expect.objectContaining({ postId: "1" }),
  });
});
