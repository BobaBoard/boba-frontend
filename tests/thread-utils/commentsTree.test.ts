import { expect, test } from "@jest/globals";

import { makeComment } from "../utils";
// TODO: figure out absolute import paths
import { makeCommentsTree } from "utils/thread-utils";

// NOTE: Chained comments also share the parent with the comment they're chained to.

test("makes comments tree (empty array)", () => {
  const commentsTree = makeCommentsTree([]);
  expect(commentsTree).toStrictEqual({
    roots: [],
    parentChainMap: new Map(),
    parentChildrenMap: new Map(),
    new: 0,
    total: 0,
  });
});

test("makes comments tree (single comment)", () => {
  const commentsTree = makeCommentsTree([makeComment({ commentId: "1" })]);
  expect(commentsTree).toStrictEqual({
    roots: [expect.objectContaining({ commentId: "1" })],
    parentChainMap: new Map(),
    parentChildrenMap: new Map(),
    new: 0,
    total: 1,
  });
});

test("makes comments tree (multiple comment roots)", () => {
  const commentsTree = makeCommentsTree([
    makeComment({ commentId: "1" }),
    makeComment({ commentId: "2" }),
    makeComment({ commentId: "3" }),
  ]);
  expect(commentsTree).toStrictEqual({
    roots: [
      expect.objectContaining({ commentId: "1" }),
      expect.objectContaining({ commentId: "2" }),
      expect.objectContaining({ commentId: "3" }),
    ],
    parentChainMap: new Map(),
    parentChildrenMap: new Map(),
    new: 0,
    total: 3,
  });
});

test("makes comments tree (comment chains)", () => {
  /* Structure:
   * 1-2-3
   */
  const commentsTree = makeCommentsTree([
    makeComment({ commentId: "1" }),
    makeComment({ commentId: "2", chainParentId: "1", parentCommentId: "1" }),
    makeComment({ commentId: "3", chainParentId: "2", parentCommentId: "1" }),
  ]);
  expect(commentsTree).toStrictEqual({
    roots: [expect.objectContaining({ commentId: "1" })],
    parentChainMap: new Map([
      ["1", expect.objectContaining({ commentId: "2" })],
      ["2", expect.objectContaining({ commentId: "3" })],
    ]),
    parentChildrenMap: new Map(),
    new: 0,
    total: 3,
  });
});

test("makes comments tree (comment replies)", () => {
  /* Structure:
   * 1 -> 2-3-4
   */
  const commentsTree = makeCommentsTree([
    makeComment({ commentId: "1" }),
    makeComment({ commentId: "2", parentCommentId: "1" }),
    makeComment({ commentId: "3", parentCommentId: "2" }),
    makeComment({ commentId: "4", parentCommentId: "2" }),
  ]);
  expect(commentsTree).toStrictEqual({
    roots: [expect.objectContaining({ commentId: "1" })],
    parentChainMap: new Map(),
    parentChildrenMap: new Map([
      ["1", [expect.objectContaining({ commentId: "2" })]],
      [
        "2",
        [
          expect.objectContaining({ commentId: "3" }),
          expect.objectContaining({ commentId: "4" }),
        ],
      ],
    ]),
    new: 0,
    total: 4,
  });
});

test("makes comments tree (comment replies with chain)", () => {
  /* Structure:
   * 1 -> 2-3-4 -> 5
   */
  const commentsTree = makeCommentsTree([
    makeComment({ commentId: "1" }),
    makeComment({ commentId: "2", parentCommentId: "1" }),
    makeComment({ commentId: "3", chainParentId: "2", parentCommentId: "1" }),
    makeComment({ commentId: "4", chainParentId: "3", parentCommentId: "1" }),
    makeComment({ commentId: "5", parentCommentId: "2" }),
  ]);
  expect(commentsTree).toStrictEqual({
    roots: [expect.objectContaining({ commentId: "1" })],
    parentChainMap: new Map([
      ["2", expect.objectContaining({ commentId: "3" })],
      ["3", expect.objectContaining({ commentId: "4" })],
    ]),
    parentChildrenMap: new Map([
      ["1", [expect.objectContaining({ commentId: "2" })]],
      ["2", [expect.objectContaining({ commentId: "5" })]],
    ]),
    new: 0,
    total: 5,
  });
});
