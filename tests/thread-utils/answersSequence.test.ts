// TODO: figure out absolute import paths
import { extractAnswersSequence } from "../../utils/thread-utils";
import { test, expect } from "@jest/globals";
import { makePost, makeComment } from "./utils";

test("extract answers sequence (single post)", () => {
  const commentsTree = extractAnswersSequence(
    [makePost({ postId: "p1", isNew: true })],
    new Map()
  );
  expect(commentsTree).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
  ]);
});

test("extract answers sequence (multiple new posts)", () => {
  const commentsTree = extractAnswersSequence(
    [
      makePost({ postId: "p1", isNew: true }),
      makePost({ postId: "p2", isNew: false }),
      makePost({ postId: "p3", isNew: true }),
      makePost({ postId: "p4", isNew: false }),
    ],
    new Map()
  );
  expect(commentsTree).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
    expect.objectContaining({ postId: "p3" }),
  ]);
});

test("extract answers sequence (all old posts)", () => {
  const commentsTree = extractAnswersSequence(
    [
      makePost({ postId: "p1", isNew: false }),
      makePost({ postId: "p2", isNew: false }),
      makePost({ postId: "p3", isNew: false }),
      makePost({ postId: "p4", isNew: false }),
    ],
    new Map()
  );
  expect(commentsTree).toStrictEqual([]);
});

test("extract answers sequence (posts with comments)", () => {
  const commentsTree = extractAnswersSequence(
    [makePost({ postId: "p1", isNew: true })],
    new Map([
      [
        "p1",
        {
          roots: [makeComment({ commentId: "c1", isNew: true })],
          parentChainMap: new Map(),
          parentChildrenMap: new Map(),
        },
      ],
    ])
  );
  expect(commentsTree).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
    expect.objectContaining({ commentId: "c1" }),
  ]);
});

test("extract answers sequence (old post with new comments)", () => {
  const commentsTree = extractAnswersSequence(
    [makePost({ postId: "p1", isNew: false })],
    new Map([
      [
        "p1",
        {
          roots: [makeComment({ commentId: "c1", isNew: true })],
          parentChainMap: new Map(),
          parentChildrenMap: new Map(),
        },
      ],
    ])
  );
  expect(commentsTree).toStrictEqual([
    expect.objectContaining({ commentId: "c1" }),
  ]);
});

test("extract answers sequence (old post with new comments)", () => {
  const commentsTree = extractAnswersSequence(
    [makePost({ postId: "p1", isNew: false })],
    new Map([
      [
        "p1",
        {
          roots: [makeComment({ commentId: "c1", isNew: true })],
          parentChainMap: new Map(),
          parentChildrenMap: new Map(),
        },
      ],
    ])
  );
  expect(commentsTree).toStrictEqual([
    expect.objectContaining({ commentId: "c1" }),
  ]);
});

test("extract answers sequence (old post with staggered comment replies)", () => {
  const commentsTree = extractAnswersSequence(
    [makePost({ postId: "p1", isNew: false })],
    new Map([
      [
        "p1",
        {
          roots: [
            makeComment({ commentId: "c1", isNew: true }),
            makeComment({ commentId: "c2", isNew: true }),
          ],
          parentChainMap: new Map(),
          parentChildrenMap: new Map([
            ["c1", [makeComment({ commentId: "c3", isNew: true })]],
          ]),
        },
      ],
    ])
  );
  expect(commentsTree).toStrictEqual([
    expect.objectContaining({ commentId: "c1" }),
    expect.objectContaining({ commentId: "c3" }),
    expect.objectContaining({ commentId: "c2" }),
  ]);
});

test("extract answers sequence (multiple poss with staggered comment replies)", () => {
  const commentsTree = extractAnswersSequence(
    [
      makePost({ postId: "p1", isNew: true }),
      makePost({ postId: "p2", isNew: true }),
    ],
    new Map([
      [
        "p1",
        {
          roots: [
            makeComment({ commentId: "c1", isNew: true }),
            makeComment({ commentId: "c2", isNew: true }),
          ],
          parentChainMap: new Map(),
          parentChildrenMap: new Map([
            ["c2", [makeComment({ commentId: "c3", isNew: true })]],
          ]),
        },
      ],
      [
        "p2",
        {
          roots: [makeComment({ commentId: "c4", isNew: true })],
          parentChainMap: new Map(),
          parentChildrenMap: new Map(),
        },
      ],
    ])
  );
  expect(commentsTree).toStrictEqual([
    expect.objectContaining({ postId: "p1" }),
    expect.objectContaining({ commentId: "c1" }),
    expect.objectContaining({ commentId: "c2" }),
    expect.objectContaining({ commentId: "c3" }),
    expect.objectContaining({ postId: "p2" }),
    expect.objectContaining({ commentId: "c4" }),
  ]);
});
